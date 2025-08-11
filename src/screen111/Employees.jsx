import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SearchBox from '../components/SearchBox'; // ✅ import reusable component

const Employees = ({ navigation }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const employeeList = [
    { id: 1, name: 'Imran Ali', position: 'HR Manager' },
    { id: 2, name: 'Ayesha Khan', position: 'Software Engineer' },
    { id: 3, name: 'Usman Raza', position: 'Accountant' },
    { id: 4, name: 'Sana Tariq', position: 'Marketing Executive' },
  ];

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  const filteredList = employeeList.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      <Header title="Employees" onMenuPress={toggleSidebar} />

      <View style={styles.mainContent}>
        <Sidebar
          navigation={navigation}
          isVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Employee List</Text>

          {/* ✅ Add reusable search box here */}
          <SearchBox
            placeholder="Search employee by name or position"
            searchText={searchText}
            setSearchText={setSearchText}
          />

          {filteredList.map((employee) => (
            <View key={employee.id} style={styles.card}>
              <Icon name="person" size={30} color="#007bff" style={styles.icon} />
              <View>
                <Text style={styles.name}>{employee.name}</Text>
                <Text style={styles.position}>{employee.position}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <Footer />
    </SafeAreaView>
  );
};

export default Employees;


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
    backgroundColor: '#f0f8ff',
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
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  position: {
    fontSize: 14,
    color: '#555',
  },
});
