import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TrainingGroups from './pages/TrainingGroups';
import CreateTrainingGroup from './pages/CreateTrainingGroup';
import ExerciseSessions from './pages/ExerciseSessions';
import CreateExerciseSession from './pages/CreateExerciseSession';
import CreateExercise from './pages/CreateExercise';
import Exercises from './pages/Exercises';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="training-groups" element={<TrainingGroups />} />
                <Route path="training-groups/create" element={<CreateTrainingGroup />} />
                <Route path="training-groups/:id/edit" element={<CreateTrainingGroup />} />
                <Route path="exercise-sessions" element={<ExerciseSessions />} />
                <Route path="exercise-sessions/create" element={<CreateExerciseSession />} />
                <Route path="exercise-sessions/:id" element={<CreateExerciseSession />} />
                <Route path="exercise-sessions/:id/edit" element={<CreateExerciseSession />} />
                <Route path="exercises" element={<Exercises />} />
                <Route path="exercises/create" element={<CreateExercise />} />
                <Route path="exercises/:id/edit" element={<CreateExercise />} />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </ConfigProvider>
    </Provider>
  );
};

export default App;