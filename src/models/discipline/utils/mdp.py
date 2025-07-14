import json
import copy
import sys

# Carregar disciplines.json
try:
    if len(sys.argv) > 1:
        json_path = sys.argv[1]
    else:
        json_path = '/content/disciplines.json'
    with open(json_path, 'r') as file:
        disciplines = json.load(file)
except FileNotFoundError:
    print(f"Erro: disciplines.json não encontrado em {json_path}")
    exit(1)
except json.JSONDecodeError:
    print("Erro: disciplines.json tem formato inválido")
    exit(1)

# Validar dados do JSON
for d in disciplines:
    if not all(key in d for key in ["name", "semester", "attended", "workload", "type", "code", "timetables", "pre_requiriments"]):
        print(f"Erro: Disciplina {d.get('name', 'desconhecida')} faltando campos obrigatórios")
        exit(1)
    for t in d["timetables"]:
        if not all(key in t for key in ["days", "hours", "teacher"]):
            print(f"Erro: Timetable inválido na disciplina {d['name']}")
            exit(1)

# Map timetable codes to time periods
period_map = {
    "AB-M": "morning", "CD-M": "morning",
    "AB-T": "afternoon", "CD-T": "afternoon",
    "AB-N": "evening", "CD-N": "evening"
}

# Check if a timetable is in the preferred period
def is_period_allowed(timetable, periods, discipline_name, ignore_tcc_period_filter):
    tcc_names = ["TCC 1", "TCC 2", "TCC I", "TCC II"]
    if ignore_tcc_period_filter and any(tcc_name in discipline_name for tcc_name in tcc_names):
        return True
    first_hour = timetable["hours"].split()[0] if timetable["hours"] else ""
    period = period_map.get(first_hour, "")
    return period in periods

# Check for time conflicts between two timetables
def has_conflict(timetable1, timetable2):
    days1, hours1 = timetable1["days"].split(), timetable1["hours"].split()
    days2, hours2 = timetable2["days"].split(), timetable2["hours"].split()
    for i in range(len(days1)):
        for j in range(len(days2)):
            if days1[i] == days2[j] and hours1[i] == hours2[j]:
                return True
    return False

# Check if a discipline's prerequisites are met
def is_eligible(discipline, attended_codes):
    if discipline["attended"]:
        return False
    missing_prereqs = [prereq for prereq in discipline["pre_requiriments"] if prereq not in attended_codes]
    if missing_prereqs:
        return False
    return True

# Filter disciplines with valid timetables
def filter_valid_disciplines(disciplines, preferred_periods, ignore_tcc_period_filter):
    valid_disciplines = []
    for d in disciplines:
        valid_timetables = [t for t in d["timetables"] if is_period_allowed(t, preferred_periods, d["name"], ignore_tcc_period_filter)]
        if valid_timetables:
            d_copy = copy.deepcopy(d)
            d_copy["timetables"] = valid_timetables
            valid_disciplines.append(d_copy)
    return valid_disciplines

# Main function to plan the curriculum sequentially
def plan_curriculum(disciplines, preferred_periods=["morning", "afternoon"], max_workload=600, max_optative_workload=400, current_student_semester=2, ignore_tcc_period_filter=False):
    valid_disciplines = filter_valid_disciplines(disciplines, preferred_periods, ignore_tcc_period_filter)
    attended_codes = set(d["code"] for d in valid_disciplines if d["attended"])
    optative_workload = 0
    plan = []
    max_semesters = 20
    current_semester = 1
    empty_semesters = 0

    while any(not d["attended"] for d in valid_disciplines) and current_semester <= max_semesters:
        eligible_disciplines = [d for d in valid_disciplines if is_eligible(d, attended_codes)]

        eligible_disciplines.sort(key=lambda d: (
            d["type"] != "OBG",
            abs(d["semester"] - current_student_semester),
            abs(max_optative_workload - (optative_workload + d["workload"]) if d["type"] == "OPT" else 0)
        ))

        semester_plan = []
        current_workload = 0
        occupied_slots = []

        for discipline in eligible_disciplines:
            for timetable in discipline["timetables"]:
                if current_workload + discipline["workload"] <= max_workload:
                    if discipline["type"] == "OPT" and optative_workload >= max_optative_workload and optative_workload != 0:
                        continue
                    conflict = any(has_conflict(timetable, slot) for slot in occupied_slots)
                    if not conflict:
                        semester_plan.append({
                            "name": discipline["name"],
                            "code": discipline["code"],
                            "timetable": timetable,
                            "workload": discipline["workload"],
                            "semester": discipline["semester"],
                            "type": discipline["type"]
                        })
                        discipline["attended"] = True
                        attended_codes.add(discipline["code"])
                        current_workload += discipline["workload"]
                        if discipline["type"] == "OPT":
                            optative_workload += discipline["workload"]
                        occupied_slots.append(timetable)
                        break

        if not semester_plan:
            empty_semesters += 1
            if empty_semesters >= 3:
                break
        else:
            empty_semesters = 0
            plan.append(semester_plan)

        current_semester += 1

    # Construir resposta final
    result = {
        "quantity_semester": len(plan),
        "semesters": plan,
    }

    disciplines_errors = []

    # Inclui disciplinas marcadas como 'attended' no JSON original
    alocated_codes = set(d["code"] for d in disciplines if d["attended"])
    for semester in plan:
        for course in semester:
            alocated_codes.add(course["code"])

    for d in disciplines:
        if d["code"] in alocated_codes:
            continue  # já alocada

        if d["type"] == "OPT":
            continue  # ignorar optativas nos erros

        reason = []

        if any(prereq not in attended_codes for prereq in d["pre_requiriments"]):
            reason.append("pré-requisitos não atendidos")

        if not any(is_period_allowed(t, preferred_periods, d["name"], ignore_tcc_period_filter) for t in d["timetables"]):
            reason.append("sem horários disponíveis no período permitido")

        if not reason:
            reason.append("conflito de horário ou limite de carga horária")

        disciplines_errors.append({
            "name": d["name"],
            "code": d["code"],
            "type": d["type"],
            "reason": ", ".join(reason)
        })

    optative_remaining = max(0, max_optative_workload - optative_workload)

    if disciplines_errors:
        result["prediction_status"] = "error"
        result["description"] = "Algumas disciplinas foram impossíveis de alocar"
        result["disciplines_erros"] = disciplines_errors
    else:
        result["prediction_status"] = "success"
        result["description"] = "matriz finalizada com sucesso!"

    result["optative_workload_remaining"] = optative_remaining

    return result

# Executar o simulador
if __name__ == "__main__":
    try:
        result = plan_curriculum(
            disciplines,
            preferred_periods=["morning", "afternoon"],
            max_workload=600,
            max_optative_workload=400,
            current_student_semester=2,
            ignore_tcc_period_filter=True
        )
        print(json.dumps(result, indent=4, ensure_ascii=False))
    except Exception as e:
        print(f"Error occurred: {str(e)}")
