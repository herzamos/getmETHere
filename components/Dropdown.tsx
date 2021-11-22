import { Dispatch, SetStateAction } from 'react';
import { Resp as BuildingResp } from '../pages/api/building_list';
//axios related stuff
import axios from 'axios';
import styles from '../styles/dropdown.module.scss';

export type Option<T> = {
	name: string;
	value: T;
};

interface DropdownProps<T> {
	value: string;
	name: string;
	options: Option<T>[];
	id: string;
	toSet: Dispatch<SetStateAction<string>>;
	onChange?: () => void;
	maxLength?: number;
}

export function Dropdown<T extends string | number>(props: DropdownProps<T>) {
	let options = props.options.map((opt) => (
		<option key={opt.value}>{opt.name}</option>
	));

	return (
		<>
			<div className={styles.DropdownField}>
				<h3 className={styles.DropdownBlock}>{props.name}</h3>
				<input
					className={`${styles.Dropdown} ${styles.DropdownBlock}`}
					list={props.id}
					placeholder={`Select the ${props.id}`}
					type="text"
					multiple
					onChange={(e) => {
						props.toSet(e.target.value);
					}}
					value={props.value}
					maxLength={props.maxLength}
				/>
				<datalist id={props.id}>{options}</datalist>
			</div>
		</>
	);
}

export const getBuildings = async () => {
	try {
		const { data } = await axios.get<BuildingResp>('/api/building_list');
		return data.building_list;
	} catch (err) {
		console.log(err);
		return [];
	}
};
