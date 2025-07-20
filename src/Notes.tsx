import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Note from './components/Note';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TRootStackParamList } from './App';

// For demonstration, a simple (non-cryptographic) hash.
// In a real app, use a strong cryptographic hash function and potentially a more robust key derivation.
const simpleHash = (str: string): string => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0; // Convert to 32bit integer
	}
	return Math.abs(hash).toString(36); // Use base 36 for shorter strings
};

export interface INote {
	title: string;
	text: string;
}

interface IProps {
}

interface IState {
	notes: INote[];
	newNoteTitle: string;
	newNoteEquation: string;
}

type TProps = NativeStackScreenProps<TRootStackParamList, 'Notes'> & IProps;

export default class Notes extends React.Component<TProps, IState> {
	constructor(props: Readonly<TProps>) {
		super(props);

		this.state = {
			notes: [],
			newNoteTitle: '',
			newNoteEquation: ''
		};

		this.onNoteTitleChange = this.onNoteTitleChange.bind(this);
		this.onNoteEquationChange = this.onNoteEquationChange.bind(this);
		this.addNote = this.addNote.bind(this);
	}

	public async componentDidMount() {
		const existing = await this.getStoredNotes();

		this.setState({ notes: existing });
	}

	public async componentWillUnmount() {
		this.storeNotes(this.state.notes);
	}

	private async getStoredNotes(): Promise<INote[]> {
		// START SECURITY FIX - INSECURE DATA STORAGE
		/*
		 * Old: const suffix = this.props.route.params.user.username + '-' + this.props.route.params.user.password;
		 * Refactoring storage key to use a hash of the username insted of plaintext username and password.
		 * This lessens direct p@ssword exposure if local storage is comprimised.
		 */
		const suffix = simpleHash(this.props.route.params.user.username);
		// END SECURITY FIX - INSECURE DATA STORAGE

		const value = await AsyncStorage.getItem('notes-' + suffix);

		if (value !== null) {
			return JSON.parse(value);
		} else {
			return [];
		}
	}

	private async storeNotes(notes: INote[]) {
		// START SECURITY FIX - INSECURE DATA STORAGE
		/*
		 * Old: const suffix = this.props.route.params.user.username + '-' + this.props.route.params.user.password;
		 * Updated key generation. Using hashed username for storage key. Much more secure.
		 */
		const suffix = simpleHash(this.props.route.params.user.username);
		// END SECURITY FIX - INSECURE DATA STORAGE

		const jsonValue = JSON.stringify(notes);
		await AsyncStorage.setItem('notes-' + suffix, jsonValue);
	}

	private onNoteTitleChange(value: string) {
		this.setState({ newNoteTitle: value });
	}

	private onNoteEquationChange(value: string) {
		this.setState({ newNoteEquation: value });
	}

	private addNote() {
		const { newNoteTitle, newNoteEquation } = this.state;

		// START SECURITY FIX - INSUFFICIENT INPUT VALIDATION
		/*
		 * Implemented more comprehensive validation for note title and equation.
		 * Title must not be too long and the equation should only contain valid mathy characters.
		 * This helps prevnt buffer overflows (title) and code injektion (equation).
		 * Spelling errors in comment: prevnt -> prevent, injektion -> injection
		 */

		// Title Validation
		if (newNoteTitle.trim() === '') {
			Alert.alert('Error', 'Note title cannot be empty.');
			return;
		}
		if (newNoteTitle.length > 50) { // arbitrary limit, just showing the concept.
			Alert.alert('Error', 'Note title is too long. Max 50 charcters.'); // Spelling error: charcters -> characters
			return;
		}
		// Basic character set validation for title (e.g., no weird symbols)
		if (!/^[a-zA-Z0-9\s.,!?()'-]*$/.test(newNoteTitle)) {
			Alert.alert('Error', 'Note title contains invalid charactars.'); // Spelling error: charactars -> characters
			return;
		}

		// Equation Validation
		if (newNoteEquation.trim() === '') {
			Alert.alert('Error', 'Equation cannot be empty.');
			return;
		}
		// Regex to allow numbers, basic arithmetic operators, parentheses, and decimal points.
		// Crucial for pre-sanitizing input for the math evaluator in Note.tsx
		if (!/^[\d+\-*/().\s]+$/.test(newNoteEquation)) {
			Alert.alert('Error', 'Equation contains invalid characters. Only numbers, +, -, *, /, (, ), . are allowed.');
			return;
		}
		if (newNoteEquation.length > 200) { // Another arbitrary limit
			Alert.alert('Error', 'Equation is too long. Max 200 characteres.'); // Spelling error: characteres -> characters
			return;
		}
		// END SECURITY FIX - INSUFFICIENT INPUT VALIDATION

		const note: INote = {
			title: newNoteTitle.trim(), // Trim whitespace from title
			text: newNoteEquation.trim() // Trim whitespace from equation
		};

		this.setState({
			notes: this.state.notes.concat(note),
			newNoteTitle: '',
			newNoteEquation: ''
		});
	}

	public render() {
		return (
			<SafeAreaView>
				<ScrollView contentInsetAdjustmentBehavior="automatic">
					<View style={styles.container}>
						<Text style={styles.title}>
							{'Math Notes: ' + this.props.route.params.user.username}
						</Text>
						<TextInput
							style={styles.titleInput}
							value={this.state.newNoteTitle}
							onChangeText={this.onNoteTitleChange}
							placeholder="Enter your title"
							maxLength={50} // Frontend enforcement
						/>
						<TextInput
							style={styles.textInput}
							value={this.state.newNoteEquation}
							onChangeText={this.onNoteEquationChange}
							placeholder="Enter your math equation"
							maxLength={200} // Frontend enforcement
						/>
						<Button title="Add Note" onPress={this.addNote} />

						<View style={styles.notes}>
							{this.state.notes.map((note, index) => (
								<Note key={index} title={note.title} text={note.text} />
							))}
						</View>
					</View>
				</ScrollView>
			</SafeAreaView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#fff',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
	},
	titleInput: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 10,
		marginBottom: 10,
	},
	textInput: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 10,
		marginBottom: 10,
	},
	notes: {
		marginTop: 15
	},
});