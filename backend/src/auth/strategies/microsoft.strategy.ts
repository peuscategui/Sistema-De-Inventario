import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(OAuth2Strategy, 'microsoft') {
  private readonly logger = new Logger(MicrosoftStrategy.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    const clientId = configService.get('MICROSOFT_CLIENT_ID');
    const clientSecret = configService.get('MICROSOFT_CLIENT_SECRET');
    const tenantId = configService.get('MICROSOFT_TENANT_ID');
    const redirectURI = configService.get('MICROSOFT_REDIRECT_URI');

    // Debug: Mostrar valores cargados
    console.log('🔍 DEBUG - Microsoft Strategy Config:');
    console.log('- CLIENT_ID:', clientId || '[NO CONFIGURADO]');
    console.log('- CLIENT_SECRET:', clientSecret ? '[CONFIGURADO]' : '[NO CONFIGURADO]');
    console.log('- TENANT_ID:', tenantId || '[NO CONFIGURADO]');
    console.log('- REDIRECT_URI:', redirectURI || '[NO CONFIGURADO]');
    console.log('- Todas las variables env:', Object.keys(process.env).filter(key => key.startsWith('MICROSOFT')));

    if (!clientId || !clientSecret || !tenantId) {
      console.warn('⚠️  Microsoft OAuth no configurado completamente');
      console.log('📝 Variables de entorno disponibles:', Object.keys(process.env).filter(key => key.includes('MICROSOFT')));
    }

    super({
      authorizationURL: `https://login.microsoftonline.com/${tenantId || 'common'}/oauth2/v2.0/authorize`,
      tokenURL: `https://login.microsoftonline.com/${tenantId || 'common'}/oauth2/v2.0/token`,
      clientID: clientId || 'not-configured',
      clientSecret: clientSecret || 'not-configured',
      callbackURL: redirectURI || 'http://localhost:3002/auth/microsoft/callback',
      scope: ['openid', 'profile', 'email', 'User.Read'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    try {
      this.logger.log('Validando usuario de Microsoft...');
      
      // Obtener información del usuario desde Microsoft Graph API
      const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const microsoftUser = userResponse.data;
      
      this.logger.log(`Usuario Microsoft: ${microsoftUser.mail || microsoftUser.userPrincipalName}`);

      // Buscar o crear usuario en la base de datos usando el método existente
      const user = await this.authService.validateMicrosoftUser({
        id: microsoftUser.id,
        displayName: microsoftUser.displayName,
        emails: [{ value: microsoftUser.mail || microsoftUser.userPrincipalName }],
        username: microsoftUser.userPrincipalName,
      });

      return user;
    } catch (error) {
      this.logger.error('Error validando usuario de Microsoft:', error);
      throw error;
    }
  }
} 