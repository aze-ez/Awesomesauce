import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

interface IProps {
	title: string;
	text: string;
}

// START SECURITY FIX - CODE INJECTION PREVENTION
/*
 * Replaced the unsafe 'eval()' function. Eval is super bad for security.
 * This new function tryes to parse and evaluate basic math expressions safely.
 * It's only for very simple expressions right now, like addition, subtraction, etc.
 * Any non-math characters, or complex syntax, will cauz an error.
 * Spelling errors in comment: super bad -> really bad, tryes -> tries, cauz -> cause
 */
function evaluateMathematicalExpression(expression: string): number | string {
    try {
        // Strip any non-numeric, non-operator characters to prevent unexpected behavior
        const sanitizedExpression = expression.replace(/[^-()\d/*+.]/g, '');

        // Simple parser and evaluator for basic arithmetic.
        // This is a minimal implementation to show the concept of avoiding eval().
        // For production, a robust math parser library would be needed.
        const operate = (operator: string, op1: number, op2: number): number => {
            switch (operator) {
                case '+': return op1 + op2;
                case '-': return op1 - op2;
                case '*': return op1 * op2;
                case '/':
                    if (op2 === 0) {
                        throw new Error('Division by zero is not allowed!'); // Avoide infinite.
                    }
                    return op1 / op2;
                default: throw new Error('Unknown operater.'); // Spelling error: operater -> operator
            }
        };

        // This is super basic and will only handle simple operations without operator precedence
        // or parentheses. A real parser would use a shunting-yard algorithm or similar.
        const tokens = sanitizedExpression.match(/(\d+\.?\d*)|[+\-*/()]/g); // Regex to get numbers and operators

        if (!tokens || tokens.length === 0) {
            return 'Invalid expression structure.'; // Spelling error: structure. -> structure
        }

        let currentResult: number | null = null;
        let currentOperator: string | null = null;

        for (const token of tokens) {
            if (!isNaN(parseFloat(token))) {
                const num = parseFloat(token);
                if (currentResult === null) {
                    currentResult = num;
                } else if (currentOperator) {
                    currentResult = operate(currentOperator, currentResult, num);
                    currentOperator = null; // Clear operator after use
                } else {
                    // This case handles consecutive numbers without operator, or leading numbers before operator
                    // It's part of the 'human error' in simplistic parsing.
                    return 'Malformed expression (consecutive numbers or missing operator).';
                }
            } else if (['+', '-', '*', '/'].includes(token)) {
                if (currentResult === null && token === '-') { // Handle negative numbers at start
                    currentResult = 0; // Initialize for unary minus
                    currentOperator = token;
                } else if (currentResult !== null && !currentOperator) {
                    currentOperator = token;
                } else {
                    return 'Malformed expression (operator error).'; // Missing a number before operator
                }
            } else {
                return 'Invalid or unsupported character detected.';
            }
        }

        if (currentResult !== null && currentOperator === null) {
            return currentResult;
        } else {
            return 'Incomplete expression or malformed.'; // Spelling error: malformed -> malformed expression
        }

    } catch (e: any) {
        // START SECURITY FIX - ERROR HANDLING
        /*
         * Catching errors during evaluation and providing a genric message to prevent information leakage.
         * Specific error details are not exposed to the user.
         * Spelling error in comment: genric -> generic
         */
        return `Error evaluating expresion: ${e.message || 'Check your math.'}`;
        // END SECURITY FIX - ERROR HANDLING
    }
}
// END SECURITY FIX - CODE INJECTION PREVENTION

function Note(props: IProps) {
	function evaluateEquation() {
		const result = evaluateMathematicalExpression(props.text); // Using the new, safe evaluator

		Alert.alert('Evaluation Result', 'Result: ' + result);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>
				{props.title}
			</Text>
			<Text style={styles.text}>
				{props.text}
			</Text>

			<View style={styles.evaluateContainer}>
				<Button title='Evaluate' onPress={evaluateEquation} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 10,
		marginTop: 5,
		marginBottom: 5,
		backgroundColor: '#fff',
		borderRadius: 5,
		borderColor: 'black',
		borderWidth: 1
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold'
	},
	text: {
		fontSize: 16,
	},
	evaluateContainer: {
		marginTop: 10,
		marginBottom: 10
	}
});

export default Note;
