import type { NextPage } from 'next';
import Head from 'next/head';
// Style
import styles from '../styles/index.module.scss';
import { IndexButtonList } from '../components/IndexButtonList';
import { Navbar } from '../components/Navbar';

import { Logo } from '../components/Logo';
/**
 * Render our main page
 */
const Home: NextPage = () => {
	return (
		<>
			<Head>
				<title>get mETHere</title>
				<meta name="description" content="Find your way around eth" />
				<link rel="icon" href="/favicon.ico" sizes="16x16" />
			</Head>
			<Navbar />
			<main className={styles.IndexMain}>
				<div>
					<h2>Get me to a...</h2>
					<div className={styles.ButtonsContainer}>
						<IndexButtonList></IndexButtonList>
					</div>
				</div>
			</main>
			<footer className={styles.FooterIndex}>
				<div className={styles.Logo}>
					<Logo></Logo>
				</div>
				{/* <button className={styles.adminButton}>
					<Link href="/admin">
						<a>Admin</a>
					</Link>
				</button> */}
			</footer>
		</>
	);
};

export default Home;
