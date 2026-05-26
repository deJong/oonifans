import { kv } from '@vercel/kv';
import SubmitForm from './SubmitForm';

export const dynamic = 'force-dynamic';
import styles from './page.module.css';

type Submission = { shortcode: string; submittedAt: number };

async function getSubmissions(): Promise<Submission[]> {
  try {
    const raw = await kv.lrange<Submission>('submissions', 0, -1);
    return raw.filter((s): s is Submission => s !== null && typeof s === 'object');
  } catch {
    return [];
  }
}

export default async function Home() {
  const submissions = await getSubmissions();
  const count = submissions.length;

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.logo}><span>ooni</span>fans</div>
        {count > 0 && (
          <div className={styles.navCount}>
            {count} pizza{count !== 1 ? 's' : ''} and counting
          </div>
        )}
      </nav>

      <header className={styles.header}>
        <div className={styles.contentWarning}>
          Content warning. This site contains <strong>extremely graphic pizza photography.</strong>
        </div>
        <h1 className={styles.headline}>
          The hottest creators.<br />
          <em>Strictly</em> for wood-fire.
        </h1>
        <p className={styles.sub}>
          Submit your Ooni pizza. It goes straight into the gallery.
          No filters, no likes, no algorithm. Just pizza.
        </p>
        <SubmitForm />
      </header>

      {count === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🍕</div>
          <h2>Nothing here yet.</h2>
          <p>Be the first to submit. The oven is on.</p>
        </div>
      ) : (
        <main className={styles.grid}>
          {submissions.map(({ shortcode }) => (
            <div key={shortcode} className={styles.cell}>
              <iframe
                src={`https://www.instagram.com/p/${shortcode}/embed/`}
                loading="lazy"
                allowFullScreen
                title={`Pizza ${shortcode}`}
                className={styles.embed}
              />
            </div>
          ))}
        </main>
      )}

      <footer className={styles.footer}>
        <span>OoniFans. Strictly For Wood-fire.</span>
        <span>
          By{' '}
          <a href="https://stuur.men" target="_blank" rel="noopener noreferrer">
            Stuurmen Branding Agency
          </a>
        </span>
      </footer>
    </>
  );
}
