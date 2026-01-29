import { Component } from "@angular/core";
import { AuthService } from "../auth.service";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  username = "";
  password = "";
  formError = "";
  loginError = "";

  constructor(
    public authService: AuthService,
    private _dialogRef: MatDialogRef<LoginComponent>,
  ) {}

  login() {
    // Reset the form error message each time login is attempted
    this.formError = "";

    if (!this.username) {
      // Set a general form error if either field is empty
      this.formError = "Benutzername darf nicht leer sein.";
      return;
    }

    if (!this.password) {
      this.formError = "Passwort darf nicht leer sein.";
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this._dialogRef.close();
      },
      error: (error: any) =>
        (this.loginError = "Falscher Benutzername oder falsches Passwort."),
    });
    // empty the form
    this.username = "";
    this.password = "";
  }

  getUsername(): string {
    const token = this.authService.getDecodedAccessToken();
    return token ? token.username : "";
  }

  logout() {
    this.authService.logout();
    this._dialogRef.close();
  }
}
