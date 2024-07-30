import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IAppDetailsProps {
  description1: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
  title: string;
    description: string; 
    link: string;
    version: string;
    attachment: File;
    idCategory: number;
    id: number; 

}
