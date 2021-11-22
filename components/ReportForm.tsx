import { Dispatch, SetStateAction, useState } from 'react';
import styles from '../styles/Map.module.scss';
import formStyles from '../styles/ReportForm.module.scss';
// X icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';

export function ReportForm(props: {
	setReport: Dispatch<SetStateAction<boolean>>;
	info: {
		title: string;
		status: string;
	};
}) {
	const [message, setMessage] = useState(
		'Dear Mr. Responsible,\n\nI have encountered problems with the ' +
			props.info.title +
			'.'
	);
	/**
	 * Sets up the report system for issues and complaints
	 * ---------------------------------------------------
	 * TODO: actually use report data
	 */
	return (
		<div className={formStyles.Filter}>
			<div className={formStyles.ReportWindow}>
				<h2>Report problem</h2>
				<a
					className={styles.closeButton}
					onClick={() => {
						props.setReport(false);
					}}
				>
					<FontAwesomeIcon icon={faWindowClose} className={styles.closeIcon} />
				</a>
				<form className={formStyles.Form}>
					<textarea
						className={formStyles.Message}
						rows={5}
						onChange={(e) => setMessage(e.target.value)}
						value={message}
					></textarea>
					<button
						className={formStyles.button}
						type="submit"
						onClick={() => {
							props.setReport(false);
						}}
					>
						Send
					</button>
				</form>
			</div>
		</div>
	);
}
