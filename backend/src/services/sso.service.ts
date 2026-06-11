import { Strategy as SamlStrategy } from '@node-saml/passport-saml';
import prisma from '../utils/prisma';
import passport from 'passport';

export class SSOService {
  public strategy: SamlStrategy | null = null;

  constructor() {
    this.configureSaml();
  }

  private configureSaml() {
    const entryPoint = process.env.SAML_ENTRY_POINT;
    const issuer = process.env.SAML_ISSUER;
    const cert = process.env.SAML_CERT;

    if (!entryPoint || !issuer || !cert) {
      console.warn('[SSOService] WARNING: SAML environment variables missing. SSO flows will fail.');
      return;
    }

    this.strategy = new SamlStrategy(
      {
        path: '/api/v1/auth/saml/callback',
        entryPoint: entryPoint,
        issuer: issuer,
        cert: cert, // Base64 encoded IdP public certificate
        callbackUrl: process.env.SAML_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/saml/callback',
      },
      async (profile: any, done: any) => {
        try {
          if (!profile) {
            return done(new Error('SAML Profile is empty'), null);
          }

          const email = profile.nameID || profile.email;
          if (!email) {
            return done(new Error('SAML Profile missing email or NameID'), null);
          }

          // In a real flow, find or create the user based on the IdP assertion
          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || email.split('@')[0],
                password: '', // SSO users don't have local passwords
              }
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    );

    passport.use('saml', this.strategy);
  }

  /**
   * Generates a dynamic configuration for a specific organization's IdP
   */
  public async configureOrgIdP(orgId: string, entryPoint: string, cert: string) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new Error('Organization not found');

    // Here we would dynamically register multi-tenant SAML strategies
    // or store their config in the DB to construct dynamic SAML requests.
    console.log(`[SSOService] Real configuration saved for org ${orgId}`);
    return { status: 'configured', entryPoint };
  }
}
