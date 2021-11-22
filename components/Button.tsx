// Font awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faBookReader,
	faShower,
	faPrint,
	faCoffee,
	faRestroom,
	faCookieBite,
	faIdCard,
} from '@fortawesome/free-solid-svg-icons';

library.add(faCoffee);

import { IconProp, library } from '@fortawesome/fontawesome-svg-core';
import { Dispatch, SetStateAction } from 'react';
import styles from '../styles/button.module.scss';
import { LandmarkType } from '../building';
export interface ButtonProps {
	icon: IconProp;
	name: string;
	value: LandmarkType;
	// selected: boolean;
	changeHandler: Dispatch<SetStateAction<LandmarkType | undefined>>;
}

export function Button(props: ButtonProps) {
	return (
		<button
			className={`${styles.ServiceChoiceButton}`}
			onClick={() => props.changeHandler(props.value)}
		>
			<div className={`${styles.ServiceChoiceButtonContent}`}>
				<div className={`${styles.ServiceChoiceButtonIcon}`}>
					<FontAwesomeIcon icon={props.icon} />
				</div>
				{props.name}
			</div>
		</button>
	);
}
