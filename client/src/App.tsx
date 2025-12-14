import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AccountsList from "./pages/accounts/AccountsList";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/accounts" component={AccountsList} />
          <Route component={NotFound} />
        </Switch>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
