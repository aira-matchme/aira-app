import { TextInput } from 'react-native';

import { colors } from './colors';

/** App-wide TextInput caret + selection colors (iOS + Android). */
export function configureTextInputDefaults(): void {
  const existing = TextInput.defaultProps ?? {};
  TextInput.defaultProps = {
    ...existing,
    cursorColor: colors.textField.cursor,
    selectionColor: colors.textField.selection,
  };
}
