import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === 'en';

  return (
    <>
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src="/images/hero-tech.webp" alt="" />
        <div className="wrap">
          <h1>{isEn ? 'Privacy Policy' : 'Politique de confidentialité'}</h1>
          <div className="breadcrumb">
            <a href={`/${locale}`}>{isEn ? 'Home' : 'Accueil'}</a>
            <span className="sep">/</span>
            {isEn ? 'Privacy Policy' : 'Confidentialité'}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap blog-content" style={{ maxWidth: 820, margin: '0 auto' }}>
          {isEn ? (
            <>
              <h2>Cookies we use</h2>
              <p>
                lelaboratoire.ma currently uses only cookies necessary for the site to function
                (session and shopping cart). We do not currently use analytics or marketing
                cookies.
              </p>
              <h2>What we record when you choose</h2>
              <p>
                When you accept or reject cookies, we record your choice, the date and time,
                your language, your browser/device information (user agent), and a one-way
                hashed version of your IP address — never the raw address — as proof of consent
                in case of an audit under Moroccan Law 09-08
                (CNDP) or the EU GDPR. This record is kept indefinitely as compliance evidence
                and is not used to build a profile of you.
              </p>
              <h2>Your rights</h2>
              <p>
                You can access, correct, or request deletion of your data at any time by writing
                to <a href="mailto:contact@lelaboratoire.ma">contact@lelaboratoire.ma</a>.
              </p>
            </>
          ) : (
            <>
              <h2>Cookies utilisés</h2>
              <p>
                lelaboratoire.ma utilise aujourd&apos;hui uniquement des cookies nécessaires au
                fonctionnement du site (session et panier). Aucun cookie analytique ou
                publicitaire n&apos;est utilisé pour le moment.
              </p>
              <h2>Ce que nous enregistrons lors de votre choix</h2>
              <p>
                Lorsque vous acceptez ou refusez les cookies, nous enregistrons votre choix, la
                date et l&apos;heure, votre langue, les informations sur votre navigateur/appareil
                (user agent), ainsi qu&apos;une version hachée (non réversible) de votre adresse
                IP — jamais l&apos;adresse brute — comme preuve de
                consentement en cas de contrôle au titre de la loi marocaine 09-08 (CNDP) ou du
                RGPD européen. Cet enregistrement est conservé indéfiniment comme preuve de
                conformité et ne sert pas à établir un profil vous concernant.
              </p>
              <h2>Vos droits</h2>
              <p>
                Vous pouvez accéder à vos données, les corriger ou demander leur suppression à
                tout moment en écrivant à{' '}
                <a href="mailto:contact@lelaboratoire.ma">contact@lelaboratoire.ma</a>.
              </p>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
