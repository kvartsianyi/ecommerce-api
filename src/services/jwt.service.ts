import jwt from 'jsonwebtoken';

import { TOKEN_CONFIG_MAP } from '@/config';
import { DualTokenActions, SingleTokenActions, SingleTokenConfig, TokenPair } from '@/models';

class JwtService {
  async generateTokenPair(
    action: DualTokenActions,
    payload: Record<string, unknown>,
  ): Promise<TokenPair> {
    const tokenPairConfig = TOKEN_CONFIG_MAP[action];

    const accessToken = await this.generateToken(tokenPairConfig.ACCESS_TOKEN, payload);
    const refreshToken = await this.generateToken(tokenPairConfig.REFRESH_TOKEN, payload);

    return { accessToken, refreshToken };
  }

  async generateToken(
    action: SingleTokenActions,
    payload: Record<string, unknown>,
  ): Promise<string>;
  async generateToken(config: SingleTokenConfig, payload: Record<string, unknown>): Promise<string>;
  async generateToken(
    actionOrConfig: SingleTokenActions | SingleTokenConfig,
    payload: Record<string, unknown>,
  ): Promise<string> {
    const tokenConfig =
      typeof actionOrConfig === 'string' ? TOKEN_CONFIG_MAP[actionOrConfig] : actionOrConfig;

    return jwt.sign(payload, tokenConfig.SECRET_KEY, {
      expiresIn: tokenConfig.LIFETIME,
    });
  }
}

export default new JwtService();
