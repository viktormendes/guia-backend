export class HelpDashboardRequesterDto {
  name: string;
  username: string;
  status: string;
  requests: number;
}

export class HelpDashboardActiveHelpersDto {
  month: string;
  presential: number;
  chat: number;
  video: number;
}

export class HelpDashboardRequestsDto {
  total: number;
  byType: {
    presential: number;
    chat: number;
    video: number;
  };
  growthPercent: number;
  byHour: {
    [hour: string]: { presential: number; chat: number; video: number };
  };
}

export class HelpDashboardDto {
  requests: HelpDashboardRequestsDto;
  activeHelpers: HelpDashboardActiveHelpersDto[];
  todayRequesters: HelpDashboardRequesterDto[];
}
