import 'react-native-gesture-handler';
import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './src/screen/Login';
import Home from './src/screen/Home';
import Employees from './src/screen/Employees';
import Attendence from './src/screen/Attendence';
import Roster from './src/screen/Roster';
import TeamTasks from './src/screen/TeamTasks';
import LeaveRequest from './src/screen/LeaveRequest';
import Training from './src/screen/Training';
import Announcement from './src/screen/Announcement';
import Policies from './src/screen/Policies';
import EmployeeDetails from './src/screen/EmployeeDetails';
import TrainingDetails  from './src/screen/TrainingDetails';
import AnnouncementDetails  from './src/screen/AnnouncementDetails';
import PolicyDetails  from './src/screen/PolicyDetails';
import TaskDetails  from './src/screen/TaskDetails';
import SessionCheck   from './src/screen/SessionCheck';

const Stack = createNativeStackNavigator();

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="SessionCheck" 
          component={SessionCheck} 
          options={{ animationEnabled: false }} 
        />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Employees" component={Employees} />
         <Stack.Screen 
          name="EmployeeDetails" 
          component={EmployeeDetails} 
          options={{ title: 'Employee Details' }}
        />
        <Stack.Screen name="Attendence" component={Attendence} />
        <Stack.Screen name="Roster" component={Roster} />
        <Stack.Screen name="TeamTasks" component={TeamTasks} />
          <Stack.Screen 
          name="TaskDetails" 
          component={TaskDetails} 
          options={{ title: 'Task Details' }}
        />
        <Stack.Screen name="LeaveRequest" component={LeaveRequest} />
        <Stack.Screen name="Training" component={Training} />
         <Stack.Screen 
          name="TrainingDetails" 
          component={TrainingDetails} 
          options={{ title: 'Training Details' }}
        />
        <Stack.Screen name="Announcement" component={Announcement} />
             <Stack.Screen 
          name="AnnouncementDetails" 
          component={AnnouncementDetails} 
          options={{ title: 'Announcement Details' }}
        />
        <Stack.Screen name="Policies" component={Policies} />
              <Stack.Screen 
          name="PolicyDetails" 
          component={PolicyDetails} 
          options={{ title: 'Policy Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
