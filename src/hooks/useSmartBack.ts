import { useNavigate } from 'react-router-dom';

/**
 * useSmartBack
 * 
 * Returns a `goBack` function that navigates back in history when possible,
 * or redirects to `fallback` if the user arrived directly (no history entry).
 *
 * Prevents:
 * - Blank screens when navigating back beyond the app root
 * - Redirecting to /auth after pressing back from protected pages
 * - Loops caused by replace() stacking
 */
export const useSmartBack = (fallback = '/') => {
  const navigate = useNavigate();

  const goBack = () => {
    // history.length <= 2 means the user opened this page directly
    // (entry 1 = initial blank, entry 2 = this page)
    if (window.history.length <= 2) {
      navigate(fallback, { replace: true });
    } else {
      navigate(-1);
    }
  };

  return goBack;
};
