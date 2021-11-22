import {
	Provider as SessionProvider,
	signIn,
	useSession,
} from 'next-auth/client';
import { AppType } from 'next/dist/shared/lib/utils';
import React from 'react';
import Head from 'next/head';
import '../styles/style.scss';
interface AuthPage {
	auth?: boolean;
}
// ====================== DO NOT TOUCH THIS ======================
import { config, dom } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;
// ===============================================================

/**
 * Renders our main page
 */
const MyApp: AppType = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	return (
		<>
			<Head>
				<title>get mETHere</title>
				<meta name="description" content="Find your way around eth" />
				<link rel="shortcut icon" href="/favicon.ico" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200&display=swap"
					rel="stylesheet"
				></link>
				{/* ====== DO NOT REMOVE ====== */}
				<style>{dom.css()}</style>
				{/* ============================ */}45345x`4
			</Head>
			{/* <SessionProvider session={session}>
				{(Component as AuthPage).auth ? (
					<Auth>
						<Component {...pageProps} />
					</Auth>
				) : ( */}
			<Component {...pageProps} />
			{/* )}
			</SessionProvider> */}
		</>
	);
};

const Auth: React.FC = ({ children }) => {
	const [session, loading] = useSession();

	const isUser = session?.user !== undefined;
	React.useEffect(() => {
		if (loading) return;
		if (!isUser) signIn();
	}, [isUser, loading]);

	if (isUser) {
		return <>{children}</>;
	}

	return <div>Loading...</div>;
};

export default MyApp;
