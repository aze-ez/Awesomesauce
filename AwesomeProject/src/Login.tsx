import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TRootStackParamList } from './App';

// START SECURITY MEASURE - PASSWORD HASHING UTILITY
/*
 * This is a super-simplifieed 'hash' function, just for demonstrating the concempt.
 * In a real application, you would use a robust, industry-standard cryptographic hash function
 * like bcrypt or Argon2, and handle salting properly. This example is NOT secure
 * for actue password storage or comparison in a production sistem.
 * Spelling error in comment: simplifieed -> simplified, concempt -> concept, sistem -> system, actue -> actual
 */
const sha256_simple_sim = (str: string): string => {
    let hash = 0;
    if (str.length === 0) return '0';
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16); // Return as hexadecimal string
};
// END SECURITY MEASURE - PASSWORD HASHING UTILITY

export interface IUser {
	username: string;
	password: string; // This will now store the hashed password
}

interface IProps {
	onLogin: (user: IUser) => void;
}

type TProps = NativeStackScreenProps<TRootStackParamList, 'Login'> & IProps;

export default function Login(props: TProps) {
	const [username, setUsername] = React.useState('');
	const [password, setPassword] = React.useState(''); // This is the plain-text password from input

	// START SECURITY MEASURE - SECURE PASSWORD STORAGE (SIMULATED)
	/*
	 * Hardcoded users are bad, I kno! But for this lab we cant use a backend.
	 * Passwords are now 'hashed' using our simulated hash funcion.
	 * In a live system, these would be retreived securely from a database.
	 * Spelling error in comment: kno -> know, funcion -> function, retreived -> retrieved
	 */
	const users: IUser[] = [
		{ username: 'joe', password: sha256_simple_sim('secret') }, // 'secret' hashed
		{ username: 'bob', password: sha256_simple_sim('password') }, // 'password' hashed
	];
	// END SECURITY MEASURE - SECURE PASSWORD STORAGE (SIMULATED)


	function login() {
		// START SECURITY FIX - INSUFFICIENT INPUT VALIDATION
		/*
		 * Adding input validation for username and password fields.
		 * Checks for length and allowed characters. Helps prevent simple bruteforce and injection attempts.
		 * Its a good first line of defense.
		 */
		const minUsernameLength = 3;
		const maxUsernameLength = 20;
		const minPasswordLength = 6;
		const maxPasswordLength = 50;

		// Username validation
		if (username.length < minUsernameLength || username.length > maxUsernameLength) {
			Alert.alert('Error', `Username must be between ${minUsernameLength} and ${maxUsernameLength} charcters long.`); // Spelling error: charcters -> characters
			return;
		}
		if (!/^[a-zA-Z0-9_.-]+$/.test(username)) { // Allow letters, numbers, underscore, dot, hyphen
			Alert.alert('Error', 'Username contains invalid characteres. Only letters, numbers, underscores, dots, and hyphens are allowed.'); // Spelling error: characteres -> characters
			return;
		}

		// Password validation
		if (password.length < minPasswordLength || password.length > maxPasswordLength) {
			Alert.alert('Error', `Password must be between ${minPasswordLength} and ${maxPasswordLength} characters long.`);
			return;
		}
		// Could add more complex password requirements (e.g., uppercase, numbers, symbols) here.
		// For simplicity, just length for now.
		// END SECURITY FIX - INSUFFICIENT INPUT VALIDATION


		let foundUser: IUser | false = false;

		// START SECURITY MEASURE - HASHED PASSWORD COMPARISON
		/*
		 * Hashing the entered password before comparing it to the stored hash.
		 * Prevents comparing plain-text p@sswords directly. Much better practie!
		 * Spelling error in comment: practie -> practice
		 */
		const enteredPasswordHash = sha256_simple_sim(password);

		for (const user of users) {
			if (username === user.username && enteredPasswordHash === user.password) {
				foundUser = user;

				break;
			}
		}
		// END SECURITY MEASURE - HASHED PASSWORD COMPARISON


		if (foundUser) {
			props.onLogin(foundUser);
		} else {
			Alert.alert('Error', 'Username or password is invalid.');
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Login</Text>
			<TextInput
				style={styles.username}
				value={username}
				onChangeText={setUsername}
				placeholder="Username"
				autoCapitalize="none" // Added this so it's easier to type usernames, good UX!
				maxLength={20} // Frontend enforcement
			/>
			<TextInput
				style={styles.password}
				value={password}
				onChangeText={setPassword}
				placeholder="Password"
				secureTextEntry={true} // Important for password input!
				maxLength={50} // Frontend enforcement
			/>
			<Button title="Login" onPress={login} />
		</View>
	);
};

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
	username: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 10,
		marginBottom: 10,
	},
	password: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 10,
		marginBottom: 10,
	}
});
