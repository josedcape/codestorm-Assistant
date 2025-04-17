import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
<<<<<<< HEAD
import EditorPage from "@/pages/EditorPage";
=======
import Home from "@/pages/Home";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AppProvider } from "./context/AppContext";
>>>>>>> 132aeba36e2ea9de048066f0f5011c34e421d7d7

function Router() {
  return (
    <Switch>
<<<<<<< HEAD
      <Route path="/" component={EditorPage} />
=======
      <Route path="/" component={Home} />
>>>>>>> 132aeba36e2ea9de048066f0f5011c34e421d7d7
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
<<<<<<< HEAD
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
=======
  // Set theme on component mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
    
    // Create grid pattern background
    const body = document.body;
    body.style.backgroundColor = "#0A1929";
    body.style.backgroundImage = `
      radial-gradient(circle at 20% 20%, rgba(14, 42, 71, 0.4) 0%, transparent 40%),
      radial-gradient(circle at 80% 80%, rgba(14, 42, 71, 0.4) 0%, transparent 40%)
    `;
    body.style.minHeight = "100vh";
    body.style.overflowX = "hidden";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen"
        >
          <Router />
          <Toaster />
        </motion.div>
      </AppProvider>
>>>>>>> 132aeba36e2ea9de048066f0f5011c34e421d7d7
    </QueryClientProvider>
  );
}

export default App;
