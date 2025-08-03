import jwt, { JwtPayload } from 'jsonwebtoken';

import { TOKEN_CONFIG_MAP } from '@/config';
import { TokenConfig, TokenPair, TokenPairActions } from '@/models';
import { ERROR_MESSAGES, TokenAction } from '@/constants';
import { BadRequestException } from '@/exceptions';

class JwtService {
  async generateTokenPair(
    payload: JwtPayload,
    { accessTokenAction, refreshTokenAction }: TokenPairActions,
  ): Promise<TokenPair> {
    const accessTokenConfig = TOKEN_CONFIG_MAP[accessTokenAction];
    const refreshTokenConfig = TOKEN_CONFIG_MAP[refreshTokenAction];

    const accessToken = await this.generateToken(payload, accessTokenConfig);
    const refreshToken = await this.generateToken(payload, refreshTokenConfig);

    return { accessToken, refreshToken };
  }

  async generateToken(payload: JwtPayload, action: TokenAction): Promise<string>;
  async generateToken(payload: JwtPayload, config: TokenConfig): Promise<string>;
  async generateToken(
    payload: JwtPayload,
    actionOrConfig: TokenAction | TokenConfig,
  ): Promise<string> {
    const tokenConfig = this.getTokenConfig(actionOrConfig);

    return jwt.sign(payload, tokenConfig.SECRET_KEY, {
      expiresIn: tokenConfig.LIFETIME,
    });
  }

  async verifyToken<T extends JwtPayload = JwtPayload>(
    token: string,
    action: TokenAction,
  ): Promise<T>;
  async verifyToken<T extends JwtPayload = JwtPayload>(
    token: string,
    config: TokenConfig,
  ): Promise<T>;
  async verifyToken<T extends JwtPayload = JwtPayload>(
    token: string,
    actionOrConfig: TokenAction | TokenConfig,
  ): Promise<T> {
    try {
      const tokenConfig = this.getTokenConfig(actionOrConfig);

      const payload = (await jwt.verify(token, tokenConfig.SECRET_KEY)) as T;

      return payload;
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException(ERROR_MESSAGES.TOKEN_INVALID_OR_EXPIRED);
      }

      throw err;
    }
  }

  private getTokenConfig(actionOrConfig: TokenAction | TokenConfig): TokenConfig {
    return typeof actionOrConfig === 'string'
      ? (TOKEN_CONFIG_MAP[actionOrConfig] as TokenConfig)
      : actionOrConfig;
  }
}

export default new JwtService();
