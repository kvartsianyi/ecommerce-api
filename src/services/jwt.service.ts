import jwt, { JwtPayload } from 'jsonwebtoken';

import { TOKEN_CONFIG_MAP } from '@/config';
import { DualTokenActions, SingleTokenActions, TokenConfig, TokenPair } from '@/models';

class JwtService {
  async generateTokenPair(payload: JwtPayload, action: DualTokenActions): Promise<TokenPair> {
    const tokenPairConfig = TOKEN_CONFIG_MAP[action];

    const accessToken = await this.generateToken(payload, tokenPairConfig.ACCESS_TOKEN);
    const refreshToken = await this.generateToken(payload, tokenPairConfig.REFRESH_TOKEN);

    return { accessToken, refreshToken };
  }

  async generateToken(payload: JwtPayload, action: SingleTokenActions): Promise<string>;
  async generateToken(payload: JwtPayload, config: TokenConfig): Promise<string>;
  async generateToken(
    payload: JwtPayload,
    actionOrConfig: SingleTokenActions | TokenConfig,
  ): Promise<string> {
    const tokenConfig = this.getTokenConfig(actionOrConfig);

    return jwt.sign(payload, tokenConfig.SECRET_KEY, {
      expiresIn: tokenConfig.LIFETIME,
    });
  }

  async verifyToken<T extends JwtPayload = JwtPayload>(
    token: string,
    action: SingleTokenActions,
  ): Promise<T>;
  async verifyToken<T extends JwtPayload = JwtPayload>(
    token: string,
    config: TokenConfig,
  ): Promise<T>;
  async verifyToken<T extends JwtPayload = JwtPayload>(
    token: string,
    actionOrConfig: SingleTokenActions | TokenConfig,
  ): Promise<T> {
    const tokenConfig = this.getTokenConfig(actionOrConfig);

    const payload = (await jwt.verify(token, tokenConfig.SECRET_KEY)) as T;

    return payload;
  }

  private getTokenConfig(actionOrConfig: SingleTokenActions | TokenConfig): TokenConfig {
    return typeof actionOrConfig === 'string'
      ? (TOKEN_CONFIG_MAP[actionOrConfig] as TokenConfig)
      : actionOrConfig;
  }
}

export default new JwtService();
