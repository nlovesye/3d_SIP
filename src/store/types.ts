
import { IRouter } from '@/router'

export interface RootStateTypes {
    headerHeight: number;
    contentWidth: number;
    contentHeight: number;
    isCollapsed: boolean;
    currentRouter: IRouter | null;
    activeMenu: string,
    access_token: string;
    refresh_token: string;
    userId: string | number;
    user_powers: any[];
}