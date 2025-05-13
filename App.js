import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


// Import Screens
import WelcomeScreen from './src/WelcomeScreen';
import Starting from './src/Starting';
import StudentDashboard from './src/student/StudentDashboard';
import ChatsScreen from './src/student/ChatsScreen';
import ProjectTracking from './src/student/ProjectTracking';
import CommunicationTool from './src/student/CommunicationTool';
// import PrerequisiteSubjects from './src/student/PrerequisiteSubjects';
import Login from './src/student/Login';
import Signup from './src/student/Sinup';

import SupervisorDashboard from './src/supervisor/SupervisorDashboard';
import SChatScreen from './src/supervisor/SChatScreen';
import SupervisorProjectTracking from './src/supervisor/SupervisorProjectTracking';
// import SupervisorDocumentManagement from './src/supervisor/SupervisorDocumentManagement';
import SupervisorCommunicationTool from './src/supervisor/Communication';
// import SupervisorFeedbackEvaluation from './src/supervisor/FeedbackEvaluation';
// import SupervisorTaskManagement from './src/supervisor/TaskManagement';
// import SupervisorAutomatedReminder from './src/supervisor/AutomatedReminder';
import SupervisorChangePassword from './src/supervisor/SupervisorChgPass';
import SupervisorLogin from './src/supervisor/SLogin';

const Stack = createNativeStackNavigator();

const App = () => {
  return (

      <NavigationContainer>
        <Stack.Navigator initialRouteName="Starting">
          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Starting" component={Starting} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="StudentDashboard" component={StudentDashboard} options={{ headerShown: false }} />
          <Stack.Screen name="ProjectTracking" component={ProjectTracking} options={{ headerShown: false }} />
          <Stack.Screen name="CommunicationTool" component={CommunicationTool} options={{ headerShown: false }} />
          <Stack.Screen name="ChatsScreen" component={ChatsScreen} options={{ headerShown: false }} />
          {/* <Stack.Screen name="PrerequisiteSubjects" component={PrerequisiteSubjects} /> */}

          <Stack.Screen name="SLogin" component={SupervisorLogin} options={{ headerShown: false }} />
          <Stack.Screen name="SupervisorDashboard" component={SupervisorDashboard} options={{ headerShown: false }} />
          <Stack.Screen name="SupervisorProjectTracking" component={SupervisorProjectTracking} options={{ headerShown: false }} />
          <Stack.Screen name="SChatScreen" component={SChatScreen} options={{ headerShown: false }} />
          {/* <Stack.Screen name="SupervisorDocumentManagement" component={SupervisorDocumentManagement} /> */}
          <Stack.Screen name="SupervisorCommunicationTool" component={SupervisorCommunicationTool} options={{ headerShown: false }} />
          {/* <Stack.Screen name="SupervisorFeedbackEvaluation" component={SupervisorFeedbackEvaluation} />
          <Stack.Screen name="SupervisorTaskManagement" component={SupervisorTaskManagement} />
          <Stack.Screen name="SupervisorAutomatedReminder" component={SupervisorAutomatedReminder} /> */}
          <Stack.Screen name="SupervisorChgPass" component={SupervisorChangePassword} />
        </Stack.Navigator>
      </NavigationContainer>
   
  );
};

export default App;
