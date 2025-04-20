import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { userService } from '../service/users.service';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private userService: userService,
    private cookieService: CookieService,
    private router: Router
  ) {}
  @ViewChild('btn1') btn1!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnContainer1') btnContainer1!: ElementRef<HTMLDivElement>;
  @ViewChild('btn2') btn2!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnContainer2') btnContainer2!: ElementRef<HTMLDivElement>;
  @ViewChild('msg') msg!: ElementRef<HTMLDivElement>;
  @ViewChild('note') note!: ElementRef<HTMLDivElement>;
  @ViewChild('account') account!: ElementRef<HTMLInputElement>;
  @ViewChild('password') password!: ElementRef<HTMLInputElement>;
  @ViewChild('user') user!: ElementRef<HTMLInputElement>;
  @ViewChild('email') email!: ElementRef<HTMLInputElement>;
  @ViewChild('pass') pass!: ElementRef<HTMLInputElement>;
  @ViewChild('pass_check') pass_check!: ElementRef<HTMLInputElement>;
  signInAccount = '';
  signInPassword = '';
  signUpUser = '';
  signUpEmail = '';
  signUpPassword = '';
  signUpPasswordConfirm = '';
  isLoginDisabled = true;
  isRegisterDisabled = true;
  message = '';
  notifical = '';
  isRightPanelActive = false;
  // Hàm RightPanel
  togglePanel(isRightPanelActive: boolean) {
    this.isRightPanelActive = isRightPanelActive;
  }

  // Hàm shiftButtonLogin
  shiftButtonLogin() {
    this.showMsg();
    const positions = [
      'shift-left',
      'shift-top',
      'shift-right',
      'shift-bottom',
    ];
    const currentPosition = positions.find((dir) =>
      this.btn2.nativeElement.classList.contains(dir)
    );
    const nextPosition =
      positions[(positions.indexOf(currentPosition!) + 1) % positions.length];
    this.btn2.nativeElement.classList.remove(currentPosition!);
    this.btn2.nativeElement.classList.add(nextPosition);
  }
  // Hàm shiftButtonRegister
  shiftButtonRegister() {
    this.showNot();
    const positions = [
      'shift-left',
      'shift-top',
      'shift-right',
      'shift-bottom',
    ];
    const currentPosition = positions.find((dir) =>
      this.btn1.nativeElement.classList.contains(dir)
    );
    const nextPosition =
      positions[(positions.indexOf(currentPosition!) + 1) % positions.length];
    this.btn1.nativeElement.classList.remove(currentPosition!);
    this.btn1.nativeElement.classList.add(nextPosition);
  }

  // Hàm showMsg
  showMsg() {
    const isEmpty =
      this.account.nativeElement.value === '' ||
      this.password.nativeElement.value === '';
    this.btn2.nativeElement.classList.toggle('no-shift', !isEmpty);

    if (isEmpty) {
      this.isLoginDisabled = true;
      this.msg.nativeElement.style.color = 'rgb(218 49 49)';
      this.message = 'Vui lòng điền đầy đủ thông tin!!';
    } else {
      this.message = "Gút chóp...Let's play!";
      this.msg.nativeElement.style.color = '#46DFB1';
      this.isLoginDisabled = false;
      this.btn2.nativeElement.classList.add('no-shift');
    }
  }
  showNot() {
    const isNull =
      this.user.nativeElement.value === '' ||
      this.email.nativeElement.value === '' ||
      this.pass.nativeElement.value === '' ||
      this.pass_check.nativeElement.value === '';
    this.btn1.nativeElement.classList.toggle('no-shift', !isNull);
    if (isNull) {
      this.isRegisterDisabled = true;
      this.note.nativeElement.style.color = 'rgb(218 49 49)';
      this.notifical = 'Vui lòng điền đầy đủ thông tin!!';
    } else {
      this.notifical = 'I remembered the information';
      this.note.nativeElement.style.color = '#46DFB1';
      this.isRegisterDisabled = false;
      this.btn1.nativeElement.classList.add('no-shift');
    }
  }
  @HostListener('mouseover', ['$event.target'])
  onMouseOver(target: HTMLElement) {
    if (
      target === this.btnContainer2.nativeElement ||
      target === this.btn2.nativeElement
    ) {
      this.shiftButtonLogin();
    }
    if (
      target === this.btnContainer1.nativeElement ||
      target === this.btn1.nativeElement
    ) {
      this.shiftButtonRegister();
    }
  }
  @HostListener('input')
  onInput() {
    this.showNot();
    this.showMsg();
  }
  @HostListener('touchstart', ['$event.target'])
  onTouchStart(target: HTMLElement) {
    if (target === this.btn2.nativeElement) {
      this.shiftButtonLogin();
    } else if (target === this.btn1.nativeElement) {
      this.shiftButtonRegister();
    }
  }
  ngOnInit(): void {
    if (this.userService.getCookies() !== '') {
      this.router.navigate(['/home']);
    }
  }
  ngLogin() {
    this.userService.login(this.signInAccount, this.signInPassword).subscribe(
      (data) => {
        this.cookieService.set(
          'id',
          this.userService.encryptData(data.id.toString()),
          {
            expires: 1,
            secure: true,
            sameSite: 'Strict',
          }
        );
        console.log(data);
        this.userService.setToken(data.token);
        this.router.navigate(['']);
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
