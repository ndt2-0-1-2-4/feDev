import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { FriendComponent } from './friend/friend.component';
import { MessageComponent } from './message/message.component';
import { ClComponent } from './game/cl/cl.component';
import { RrComponent } from './game/rr/rr.component';
import { SpacemanComponent } from './game/spaceman/spaceman.component';
import { Slot777Component } from './game/slot777/slot777.component';
import { RechargeComponent } from './recharge/recharge.component';
import { TransferComponent } from './transfer/transfer.component';
import { PaymentComponent } from './payment/payment.component';
import { PaymentResultComponent } from './payment-result/payment-result.component';
import { MenugameComponent } from './menugame/menugame.component';
import { FootballComponent } from './football/football.component';
import { LotteryComponent } from './lottery/lottery.component';
import { authGuard } from './auth.guard';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },

  { path: 'user', component: UserComponent , canActivate: [authGuard]},
  { path: 'friend', component: FriendComponent , canActivate: [authGuard]},
  { path: 'message', component: MessageComponent , canActivate: [authGuard]},
  { path: 'game/cl', component: ClComponent , canActivate: [authGuard]},
  { path: 'game/rr', component: RrComponent , canActivate: [authGuard]},
  { path: 'game/spaceman', component: SpacemanComponent , canActivate: [authGuard]},
  { path: 'game/slot777', component: Slot777Component , canActivate: [authGuard]},
  { path: 'recharge', component: RechargeComponent , canActivate: [authGuard]},
  { path: 'atm/transfer', component: TransferComponent , canActivate: [authGuard]},
  { path: 'payment', component: PaymentComponent , canActivate: [authGuard]},
  { path: 'payment-result', component: PaymentResultComponent , canActivate: [authGuard]},
  { path: 'football', component: FootballComponent , canActivate: [authGuard]},
  { path: 'menugame', component: MenugameComponent , canActivate: [authGuard]},
  { path: 'lottery', component: LotteryComponent , canActivate: [authGuard]},

  { path: '**', redirectTo: '' }
];
