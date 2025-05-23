interface IRoom {
  abbreviation: string;
  name?: string;
  parent?: IRoom;
}

interface IDiscipline {
  name: string;
  code: string;
  attended: boolean;
  semester: number;
  workload: number;
  type: 'OBG' | 'OPT';
  timetables: ITimetable[];
  pre_requiriments: string[];
}

interface ITimetable {
  days: string;
  hours: string;
  teacher: string;
  room?: IRoom;
}

const mockDisciplinesVersion = '2025.1.004';

export const mockDisciplines: IDiscipline[] = [
  {
    name: 'CÁLCULO I',
    semester: 1,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.15',
    timetables: [
      {
        days: 'TER QUI',
        hours: 'CD-M CD-M',
        teacher: 'FRANCISCO EDSON GAMA COUTINHO',
      },
      {
        days: 'TER QUA',
        hours: 'CD-T CD-T',
        teacher: 'MANUEL RICARDO DOS SANTOS RABELO',
      },
    ],
    pre_requiriments: [],
  },
  {
    name: 'CIRCUITOS DIGITAIS',
    semester: 1,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.16',
    timetables: [
      {
        days: 'SEG QUA',
        hours: 'AB-M AB-M',
        teacher: 'OTAVIO ALCANTARA DE LIMA JUNIOR',
      },
      {
        days: 'QUA SEX',
        hours: 'CD-M CD-M',
        teacher: 'OTAVIO ALCANTARA DE LIMA JUNIOR',
      },
    ],
    pre_requiriments: [],
  },
  {
    name: 'FUNDAMENTOS DE PROGRAMAÇÃO',
    semester: 1,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.17',
    timetables: [
      {
        days: 'TER QUI',
        hours: 'AB-M AB-M',
        teacher: 'FABIO JOSÉ GOMES DE SOUSA',
      },
      { days: 'SEG QUI', hours: 'AB-T AB-T', teacher: 'AGEBSON ROCHA FAÇANHA' },
    ],
    pre_requiriments: [],
  },
  {
    name: 'MATEMÁTICA DISCRETA',
    semester: 1,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.18',
    timetables: [
      {
        days: 'SEG SEX',
        hours: 'CD-M CD-M',
        teacher: 'CICERO ERIALDO OLIVEIRA LIMA',
      },
      {
        days: 'SEG QUA',
        hours: 'CD-T AB-T',
        teacher: 'DAVID CARNEIRO DE SOUZA',
      },
    ],
    pre_requiriments: [],
  },
  {
    name: 'ÁLGEBRA LINEAR',
    semester: 2,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.19',
    timetables: [
      {
        days: 'TER QUI',
        hours: 'AB-M AB-M',
        teacher: 'JOAO VICTOR MAXIMIANO ALBUQUERQUE',
      },
      {
        days: 'TER QUI',
        hours: 'CD-T CD-T',
        teacher: 'FRANCISCO EDSON GAMA COUTINHO',
      },
    ],
    pre_requiriments: [],
  },
  {
    name: 'CÁLCULO II',
    semester: 2,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.20',
    timetables: [
      {
        days: 'TER QUA',
        hours: 'CD-M CD-M',
        teacher: 'MANUEL RICARDO DOS SANTOS RABELO',
      },
      {
        days: 'TER QUA',
        hours: 'AB-T AB-T',
        teacher: 'MANUEL RICARDO DOS SANTOS RABELO',
      },
    ],
    pre_requiriments: ['04.505.15'],
  },
  {
    name: 'FÍSICA I',
    semester: 2,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.21',
    timetables: [
      {
        days: 'SEG QUI',
        hours: 'CD-M CD-M',
        teacher: 'JOÃO CLAUDIO NUNES CARVALHO',
      },
      {
        days: 'QUA QUI',
        hours: 'CD-T AB-T',
        teacher: 'JOÃO CLAUDIO NUNES CARVALHO',
      },
    ],
    pre_requiriments: ['04.505.15'],
  },
  {
    name: 'INGLÊS INSTRUMENTAL',
    semester: 2,
    attended: false,
    workload: 40,
    type: 'OBG',
    code: '04.505.22',
    timetables: [
      { days: 'SEX', hours: 'CD-T', teacher: 'TEOFILO ROBERTO DA SILVA' },
    ],
    pre_requiriments: [],
  },
  {
    name: 'LAB. DE PROGRAMAÇÃO',
    semester: 2,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.23',
    timetables: [
      { days: 'SEG QUA', hours: 'AB-M AB-M', teacher: 'DANIEL SILVA FERREIRA' },
      {
        days: 'SEG SEX',
        hours: 'AB-T AB-T',
        teacher: 'LUIZ FERNANDO PAULINO QUEIROZ',
      },
    ],
    pre_requiriments: ['04.505.17'],
  },
  {
    name: 'ARQUITETURA DE COMPUTADORES',
    semester: 3,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.24',
    timetables: [
      {
        days: 'SEG SEX',
        hours: 'AB-M CD-M',
        teacher: 'CARLOS HENRIQUE LEITÃO CAVALCANTE',
      },
      {
        days: 'SEG SEX',
        hours: 'CD-T CD-T',
        teacher: 'LUIZ FERNANDO PAULINO QUEIROZ',
      },
    ],
    pre_requiriments: ['04.505.16'],
  },
  {
    name: 'PROBABILIDADE E ESTATÍSTICA',
    semester: 3,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.25',
    timetables: [
      {
        days: 'TER QUI',
        hours: 'AB-M AB-M',
        teacher: 'MARCOS CIRINEU AGUIAR SIQUEIRA',
      },
      {
        days: 'TER QUI',
        hours: 'CD-T CD-T',
        teacher: 'MARCOS CIRINEU AGUIAR SIQUEIRA',
      },
    ],
    pre_requiriments: ['04.505.20'],
  },
  {
    name: 'PROGRAMAÇÃO LINEAR',
    semester: 3,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.26',
    timetables: [
      {
        days: 'QUA SEX',
        hours: 'AB-M AB-M',
        teacher: 'ADRIANO TAVARES DE FREITAS',
      },
      {
        days: 'QUA SEX',
        hours: 'CD-T AB-T',
        teacher: 'ADRIANO TAVARES DE FREITAS',
      },
    ],
    pre_requiriments: ['04.505.19'],
  },
  {
    name: 'PROGRAMAÇÃO ORIENTADA A OBJETO',
    semester: 3,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.27',
    timetables: [
      {
        days: 'SEG QUA',
        hours: 'CD-M CD-M',
        teacher: 'IGOR RAFAEL SILVA VALENTE',
      },
      {
        days: 'SEG QUA',
        hours: 'AB-T AB-T',
        teacher: 'IGOR RAFAEL SILVA VALENTE',
      },
    ],
    pre_requiriments: ['04.505.23'],
  },
  {
    name: 'FÍSICA II',
    semester: 3,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.58',
    timetables: [
      {
        days: 'TER QUI',
        hours: 'CD-M CD-M',
        teacher: 'ANTONIO CARLOS DE SOUZA',
      },
    ],
    pre_requiriments: ['04.505.21'],
  },
  {
    name: 'BANCO DE DADOS',
    semester: 4,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.28',
    timetables: [
      {
        days: 'SEG QUA',
        hours: 'AB-M CD-M',
        teacher: 'DANIEL ALENCAR BARROS TAVARES',
      },
      { days: 'TER QUI', hours: 'AB-T AB-T', teacher: 'FABIANA GOMES MARINHO' },
    ],
    pre_requiriments: ['04.505.27'],
  },
  {
    name: 'CÁLCULO NUMÉRICO',
    semester: 4,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.29',
    timetables: [
      {
        days: 'TER QUI',
        hours: 'CD-M CD-M',
        teacher: 'ISRAEL GUEDES DA SILVA',
      },
    ],
    pre_requiriments: ['04.505.19', '04.505.20'],
  },
  {
    name: 'COMUNICAÇÃO DE DADOS',
    semester: 4,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.30',
    timetables: [
      {
        days: 'QUA SEX',
        hours: 'AB-M CD-M',
        teacher: 'JEAN MARCELO DA SILVA MACIEL',
      },
      {
        days: 'SEG SEX',
        hours: 'CD-T AB-T',
        teacher: 'FRANCISCO IVAN DE OLIVEIRA',
      },
    ],
    pre_requiriments: ['04.505.58'],
  },
  {
    name: 'ESTRUTURA DE DADOS',
    semester: 4,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.31',
    timetables: [
      {
        days: 'SEG SEX',
        hours: 'CD-M AB-M',
        teacher: 'OTAVIO ALCANTARA DE LIMA JUNIOR',
      },
      {
        days: 'SEG QUA',
        hours: 'AB-T AB-T',
        teacher: 'DANIEL ALENCAR BARROS TAVARES',
      },
    ],
    pre_requiriments: ['04.505.27'],
  },
  {
    name: 'LÓGICA PARA COMPUTAÇÃO',
    semester: 4,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.32',
    timetables: [
      { days: 'TER QUI', hours: 'AB-M AB-M', teacher: 'THIAGO ALVES ROCHA' },
    ],
    pre_requiriments: ['04.505.17', '04.505.18'],
  },
  //CHECK
  {
    name: 'ANÁLISE DE ALGORITMOS',
    semester: 5,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.33',
    timetables: [
      { days: 'TER QUI', hours: 'CD-M CD-M', teacher: 'THIAGO ALVES ROCHA' },
    ],
    pre_requiriments: ['04.505.31'],
  },
  //CHECK
  {
    name: 'IEEC',
    semester: 5,
    attended: false,
    workload: 40,
    type: 'OBG',
    code: '04.505.34',
    timetables: [
      { days: 'QUA', hours: 'AB-M', teacher: 'ELDER DOS SANTOS TEIXEIRA' },
      { days: 'SEX', hours: 'AB-T', teacher: 'ELDER DOS SANTOS TEIXEIRA' },
    ],
    pre_requiriments: ['04.505.58'],
  },
  //CHECK
  {
    name: 'ENGENHARIA DE SOFTWARE',
    semester: 5,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.35',
    timetables: [
      { days: 'TER QUI', hours: 'AB-M AB-M', teacher: 'FABIANA GOMES MARINHO' },
      {
        days: 'TER QUI',
        hours: 'AB-T AB-T',
        teacher: 'ISABELY DO NASCIMENTO COSTA',
      },
    ],
    pre_requiriments: ['04.505.27'],
  },
  //CHECK
  {
    name: 'GRAFOS',
    semester: 5,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.36',
    timetables: [
      {
        days: 'QUA SEX',
        hours: 'CD-M CD-M',
        teacher: 'ADRIANO TAVARES DE FREITAS',
      },
    ],
    pre_requiriments: ['04.505.31'],
  },
  //CHECK
  {
    name: 'SISTEMAS OPERACIONAIS',
    semester: 5,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.37',
    timetables: [
      { days: 'SEG SEX', hours: 'CD-M AB-M', teacher: 'DANIEL SILVA FERREIRA' },
    ],
    pre_requiriments: ['04.505.24'],
  },
  //CHECK
  {
    name: 'INTELIGÊNCIA ARTIFICIAL',
    semester: 6,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.38',
    timetables: [
      {
        days: 'SEG QUA',
        hours: 'CD-M CD-M',
        teacher: 'AMAURI HOLANDA DE SOUZA JUNIOR',
      },
    ],
    pre_requiriments: ['04.505.25', '04.505.31'],
  },
  //CHECK
  {
    name: 'LINGUAGENS DE PROGRAMAÇÃO',
    semester: 6,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.39',
    timetables: [
      {
        days: 'TER QUI',
        hours: 'AB-M AB-M',
        teacher: 'ISABELY DO NASCIMENTO COSTA',
      },
    ],
    pre_requiriments: ['04.505.27'],
  },
  //CHECK
  {
    name: 'METODOLOGIA CIENTÍFICA',
    semester: 6,
    attended: false,
    workload: 40,
    type: 'OBG',
    code: '04.505.40',
    timetables: [
      { days: 'QUI', hours: 'CD-M', teacher: 'AURENIVIA FERREIRA DA SILVA' },
    ],
    pre_requiriments: [],
  },
  //CHECK
  {
    name: 'REDES I',
    semester: 6,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.41',
    timetables: [
      {
        days: 'TER SEX',
        hours: 'CD-M CD-M',
        teacher: 'WELLINGTON ARAÚJO ALBANO',
      },
    ],
    pre_requiriments: ['04.505.30'],
  },
  //CHECK
  {
    name: 'APS',
    semester: 7,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.42',
    timetables: [
      {
        days: 'SEG SEX',
        hours: 'CD-M AB-M',
        teacher: 'CARLOS HENRIQUE LEITÃO CAVALCANTE',
      },
    ],
    pre_requiriments: ['04.505.28', '04.505.35'],
  },
  //CHECK
  {
    name: 'MICROCONTROLADORES',
    semester: 7,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.43',
    timetables: [
      {
        days: 'QUA SEX',
        hours: 'AB-M CD-M',
        teacher: 'PEDRO HERICSON MACHADO ARAÚJO',
      },
    ],
    pre_requiriments: ['04.505.24', '04.505.34'],
  },
  //CHECK
  {
    name: 'TEORIA DA COMPUTAÇÃO',
    semester: 7,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.44',
    timetables: [
      {
        days: 'SEG QUA',
        hours: 'AB-M CD-M',
        teacher: 'LUIZ FERNANDO PAULINO QUEIROZ',
      },
    ],
    pre_requiriments: ['04.505.32'],
  },
  //CHECK
  {
    name: 'TCC I',
    semester: 7,
    attended: false,
    workload: 40,
    type: 'OBG',
    code: '04.505.45',
    timetables: [
      { days: 'SEX', hours: 'AB-T', teacher: 'FABIO JOSÉ GOMES DE SOUSA' },
    ],
    pre_requiriments: ['04.505.40'],
  },
  //CHECK
  {
    name: 'ADM',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.46',
    timetables: [
      { days: 'TER QUI', hours: 'CD-M CD-M', teacher: 'FRANCISCA IONE CHAVES' },
    ],
    pre_requiriments: [],
  },
  //CHECK
  {
    name: 'INT. COMPUT. APLICADA',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.52',
    timetables: [
      {
        days: 'TER QUI',
        hours: 'AB-T AB-T',
        teacher: 'RONEY NOGUEIRA DE SOUSA',
      },
    ],
    pre_requiriments: ['04.505.19'],
  },
  //CHECK
  {
    name: 'COMPILADORES',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OBG',
    code: '04.505.47',
    timetables: [
      {
        days: 'QUA SEX',
        hours: 'CD-M AB-M',
        teacher: 'PEDRO HERICSON MACHADO ARAÚJO',
      },
    ],
    pre_requiriments: ['04.505.44'],
  },
  //CHECK
  {
    name: 'PROJETOS SOCIAIS',
    semester: 8,
    attended: false,
    workload: 40,
    type: 'OBG',
    code: '04.505.48',
    timetables: [
      {
        days: 'TER',
        hours: 'AB-M',
        teacher: 'JULIANA DE BRITO MARQUES DO NASCIMENTO',
      },
    ],
    pre_requiriments: [],
  },
  //CHECK
  {
    name: 'TCC II',
    semester: 8,
    attended: false,
    workload: 40,
    type: 'OBG',
    code: '04.505.49',
    timetables: [
      { days: 'TER', hours: 'AB-N', teacher: 'FABIANA GOMES MARINHO' },
    ],
    pre_requiriments: ['04.505.45'],
  },
  //CHECK
  {
    name: 'ED. FÍSICA',
    semester: 8,
    attended: false,
    workload: 40,
    type: 'OPT',
    code: '04.505.14',
    timetables: [
      { days: 'SEG', hours: 'AB-T', teacher: 'ADRIANO BARROS CARNEIRO' },
    ],
    pre_requiriments: [],
  },
  //CHECK
  {
    name: 'PROC. DIG. DE SINAIS',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.57',
    timetables: [
      {
        days: 'TER QUI',
        hours: 'CD-T CD-T',
        teacher: 'DOUGLAS DE ARAÚJO RODRIGUES',
      },
    ],
    pre_requiriments: ['04.505.15', '04.505.31'],
  },
  //CHECK possivel horario tjwt: { days: "TER QUI", hours: "CD-M CD-M", teacher: "CORNELI GOMES FURTADO JUNIOR" }
  {
    name: 'TJW',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.69',
    timetables: [
      {
        days: 'TER QUI',
        hours: 'CD-M CD-M',
        teacher: 'CORNELI GOMES FURTADO JUNIOR',
      },
    ],
    pre_requiriments: ['04.505.27'],
  },
  //CHECK
  {
    name: 'GESTÃO DE PROJETOS',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.51',
    timetables: [
      {
        days: 'SEG SEX',
        hours: 'AB-T AB-T',
        teacher: 'CARLOS HENRIQUE LEITÃO CAVALCANTE',
      },
    ],
    pre_requiriments: [],
  },
  //CHECK
  {
    name: 'INT. A COMPUT. GRÁFICA',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.53',
    timetables: [],
    pre_requiriments: ['04.505.19'],
  },
  //CHECK
  {
    name: 'REDES NEURAIS ARTIFICIAIS',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.63',
    timetables: [
      {
        days: 'SEG QUA',
        hours: 'AB-M AB-M',
        teacher: 'AMAURI HOLANDA DE SOUZA JUNIOR',
      },
    ],
    pre_requiriments: ['04.505.19', '04.505.25'],
  },
  //CHECK
  {
    name: 'RECONHECIMENTO DE PADRÕES',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.61',
    timetables: [
      {
        days: 'QUA SEX',
        hours: 'AB-T AB-T',
        teacher: 'PEDRO HERICSON MACHADO ARAÚJO',
      },
    ],
    pre_requiriments: ['04.505.19', '04.505.25'],
  },
  {
    name: 'LIBRAS',
    semester: 8,
    attended: false,
    workload: 40,
    type: 'OPT',
    code: '04.505.54',
    timetables: [],
    pre_requiriments: [],
  },
  {
    name: 'COMPRESSÃO DE DADOS',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.50',
    timetables: [],
    pre_requiriments: ['04.505.25'],
  },
  {
    name: 'MODELAGEM DE SISTEMAS HÍBRIDOS',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.55',
    timetables: [],
    pre_requiriments: [],
  },
  //DONE possivel horario PDI: { days: "SEG QUA", hours: "AB-M AB-M", teacher: "IGOR RAFAEL SILVA VALENTE" }
  {
    name: 'PROC. DIG. DE IMAGENS',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.56',
    timetables: [
      {
        days: 'SEG QUA',
        hours: 'AB-M AB-M',
        teacher: 'IGOR RAFAEL SILVA VALENTE',
      },
    ],
    pre_requiriments: ['04.505.15', '04.505.31'],
  },
  {
    name: 'PROGRAMAÇÃO PARALELA',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.59',
    timetables: [],
    pre_requiriments: ['04.505.33', '04.505.37'],
  },
  {
    name: 'REDES II',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.62',
    timetables: [],
    pre_requiriments: ['04.505.41'],
  },
  {
    name: 'PROJETO DE REDES',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.60',
    timetables: [],
    pre_requiriments: ['04.505.63'],
  },
  {
    name: 'REDES SEM FIO',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.64',
    timetables: [],
    pre_requiriments: ['04.505.41'],
  },
  {
    name: 'ROBÓTICA EDUCACIONAL',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.65',
    timetables: [],
    pre_requiriments: ['04.505.43'],
  },
  //CHECK
  {
    name: 'SEGURANÇA DA INFORMAÇÃO',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.66',
    timetables: [
      { days: 'SEG QUI', hours: 'AB-M AB-M', teacher: 'AGEBSON ROCHA FAÇANHA' },
    ],
    pre_requiriments: ['04.505.41'],
  },
  {
    name: 'SISTEMAS DISTRIBUÍDOS',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.67',
    timetables: [],
    pre_requiriments: ['04.505.41'],
  },
  {
    name: 'SISTEMAS EMBARCADOS',
    semester: 8,
    attended: false,
    workload: 80,
    type: 'OPT',
    code: '04.505.68',
    timetables: [],
    pre_requiriments: ['04.505.43'],
  },
];
