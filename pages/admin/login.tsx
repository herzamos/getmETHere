import { useRouter } from 'next/router';
import style from '../../styles/admin.module.scss';
/**
 * Setting up loging dummy for admin page where you can access
 * /admin/panel from. This is used for managing the landmarks
 */
const Login = () => {
	const router = useRouter();

	return (
		<>
			<body className={style.body1}>
				<div className={style.main}>
					<p className={style.sign}>Sign in</p>
					<form className={style.form1}>
						<input className={style.pass} type="text" placeholder="Username" />
						<input
							className={style.pass}
							type="password"
							placeholder="Password"
						/>
						<a
							className={style.submit}
							onClick={() => router.push('/admin/panel')}
						>
							Sign in
						</a>
						<p className={style.forgot}>
							<a className={style.a1} href="#" />
							Forgot Password?
						</p>
					</form>
				</div>
			</body>
		</>
	);
};
export default Login;
