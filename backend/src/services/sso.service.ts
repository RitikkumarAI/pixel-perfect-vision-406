import { MultiSamlStrategy } from '@node-saml/passport-saml';
import prisma from '../utils/prisma';
import passport from 'passport';
import { parseStringPromise } from 'xml2js';

export class SSOService {
  public strategy: MultiSamlStrategy | null = null;

  constructor() {
    this.configureSaml();
  }

  private configureSaml() {
    this.strategy = new (MultiSamlStrategy as any)(
      {
        passReqToCallback: true,
        getSamlOptions: async (req: any, done: any) => {
          try {
            // Determine org from query, body, or session
            const orgId = req.query.orgId || req.body.orgId || req.user?.orgId;
            if (!orgId) return done(new Error('Missing orgId for SSO'));

            const idpConfig = await prisma.idpConfig.findFirst({ where: { orgId } });
            if (!idpConfig) return done(new Error('IdP not configured for org'));

            return done(null, {
              path: '/api/v1/sso/callback',
              entryPoint: idpConfig.entryPoint,
              issuer: idpConfig.issuer,
              cert: idpConfig.cert,
              logoutUrl: idpConfig.logoutUrl,
              callbackUrl: process.env.SAML_CALLBACK_URL || 'http://localhost:5005/api/v1/sso/callback',
            });
          } catch (err) {
            return done(err);
          }
        }
      },
      async (req: any, profile: any, done: any) => {
        try {
          if (!profile) return done(new Error('SAML Profile is empty'), null);

          const email = profile.nameID || profile.email;
          if (!email) return done(new Error('SAML Profile missing email or NameID'), null);

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || email.split('@')[0],
                ssoProvider: 'saml'
              }
            });
          }
          
          // Log SSO Login
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'SSO_LOGIN',
              resourceType: 'IdP',
              resourceId: 'SAML',
              ipAddress: req.ip,
              userAgent: req.headers['user-agent']
            }
          });

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    );

    passport.use('saml', this.strategy as any);
  }

  public async importMetadata(orgId: string, xmlString: string) {
    try {
      const parsed = await parseStringPromise(xmlString);
      const entityDescriptor = parsed['EntityDescriptor'] || parsed['md:EntityDescriptor'];
      const idpSSODescriptor = entityDescriptor['IDPSSODescriptor'] || entityDescriptor['md:IDPSSODescriptor'];

      const entityId = entityDescriptor.$.entityID;
      
      const ssoServices = idpSSODescriptor[0]['SingleSignOnService'] || idpSSODescriptor[0]['md:SingleSignOnService'];
      const sloServices = idpSSODescriptor[0]['SingleLogoutService'] || idpSSODescriptor[0]['md:SingleLogoutService'];
      
      const entryPoint = ssoServices.find((s: any) => s.$.Binding.includes('HTTP-Redirect')).$.Location;
      const logoutUrl = sloServices ? sloServices.find((s: any) => s.$.Binding.includes('HTTP-Redirect')).$.Location : null;

      const keys = idpSSODescriptor[0]['KeyDescriptor'] || idpSSODescriptor[0]['md:KeyDescriptor'];
      const x509Data = keys[0]['ds:KeyInfo'][0]['ds:X509Data'][0]['ds:X509Certificate'][0];
      const cert = typeof x509Data === 'string' ? x509Data : x509Data._;

      await prisma.idpConfig.create({
        data: {
          orgId,
          provider: 'saml',
          entryPoint,
          logoutUrl,
          issuer: entityId,
          cert,
          metadataXml: xmlString
        }
      });

      return { success: true, entryPoint, logoutUrl, issuer: entityId };
    } catch (err) {
      throw new Error('Failed to parse SAML Metadata XML');
    }
  }

  public async initiateSsoLogin(email: string) {
    return { url: 'http://localhost:5005/api/v1/sso/mock?email=' + encodeURIComponent(email) };
  }
}
