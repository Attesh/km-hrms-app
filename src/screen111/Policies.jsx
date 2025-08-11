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

const Policies = ({ navigation }) => {
   const [isSidebarVisible, setSidebarVisible] = useState(false);

  const policyList = [
    { id: 1, title: 'Leave Policy', description: 'Details about annual, sick, and casual leave.' },
    { id: 2, title: 'Work From Home Policy', description: 'Guidelines for remote working.' },
    { id: 3, title: 'Code of Conduct', description: 'Behavioral expectations and rules.' },
    { id: 4, title: 'IT Usage Policy', description: 'Acceptable use of office systems.' },
  ];
const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Policies" onMenuPress={toggleSidebar} />
      <View style={styles.mainContent}>
        <Sidebar
          navigation={navigation}
          isVisible={isSidebarVisible}
          setSidebarVisible={setSidebarVisible}
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Company Policies</Text>
          {policyList.map((policy) => (
            <View key={policy.id} style={styles.card}>
              <Icon name="policy" size={28} color="#007bff" style={styles.icon} />
              <View>
                <Text style={styles.name}>{policy.title}</Text>
                <Text style={styles.description}>{policy.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      <Footer />
    </SafeAreaView>
  );
};

export default Policies;

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
    alignItems: 'flex-start',
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
    marginTop: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  description: {
    fontSize: 14,
    color: '#555',
  },
});
