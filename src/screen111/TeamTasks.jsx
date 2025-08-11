import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TeamTasks = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  const taskList = [
    { id: 1, task: 'Design Login UI', assignedTo: 'Imran Ali', status: 'Completed' },
    { id: 2, task: 'Backend API for Attendance', assignedTo: 'Ayesha Khan', status: 'In Progress' },
    { id: 3, task: 'Setup MySQL Database', assignedTo: 'Usman Raza', status: 'Pending' },
    { id: 4, task: 'Marketing Campaign Plan', assignedTo: 'Sana Tariq', status: 'Completed' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return { icon: 'check-circle', color: 'green' };
      case 'In Progress':
        return { icon: 'autorenew', color: 'orange' };
      default:
        return { icon: 'pending', color: 'gray' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Team Tasks" onMenuPress={toggleSidebar} />
      <View style={styles.mainContent}>
        <Sidebar
          navigation={navigation}
          isVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Team Tasks</Text>

          {taskList.map((task) => {
            const { icon, color } = getStatusIcon(task.status);
            return (
              <View key={task.id} style={styles.card}>
                <Icon name={icon} size={30} color={color} style={styles.icon} />
                <View>
                  <Text style={styles.task}>{task.task}</Text>
                  <Text style={styles.details}>Assigned to: {task.assignedTo}</Text>
                  <Text style={styles.details}>Status: {task.status}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <Footer />
    </SafeAreaView>
  );
};

export default TeamTasks;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff8e1',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
  },
  task: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  details: {
    fontSize: 14,
    color: '#555',
  },
});
