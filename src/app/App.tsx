import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'sonner';

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}

export default App;