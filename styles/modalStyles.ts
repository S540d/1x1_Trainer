import { StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '../utils/constants';

export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: DESIGN_TOKENS.RADIUS_XL,
    padding: DESIGN_TOKENS.SPACING_XXL,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: DESIGN_TOKENS.SPACING_LG,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: DESIGN_TOKENS.SPACING_XXL,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: DESIGN_TOKENS.SPACING_LG,
    borderRadius: 28,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
