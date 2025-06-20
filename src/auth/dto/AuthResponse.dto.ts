export class AuthResponseDto {
  constructor(accessToken: string, expiresIn: string) {
    this.accessToken = accessToken;
    this.expiresIn = expiresIn;
  }

  accessToken: string;
  expiresIn: string;
}
