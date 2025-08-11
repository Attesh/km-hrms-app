import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const Sidebar = ({ navigation, isVisible, setSidebarVisible }) => {
  const slideAnim = React.useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const navigateAndClose = (screen) => {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(false);
      navigation.navigate(screen);
    });
  };

  const sidebarItems = [
    { icon: 'home', label: 'Home', screen: 'Home' },
    { icon: 'people', label: 'Employees', screen: 'Employees' },
    { icon: 'calendar-today', label: 'Attendance', screen: 'Attendence' },
    { icon: 'schedule', label: 'Roster', screen: 'Roster' },
    { icon: 'event-note', label: 'Leave Requests', screen: 'LeaveRequest' },
    { icon: 'assignment', label: 'Team Tasks', screen: 'TeamTasks' },
    { icon: 'school', label: 'Training', screen: 'Training' },
    { icon: 'announcement', label: 'Announcements', screen: 'Announcement' },
    { icon: 'policy', label: 'Policies', screen: 'Policies' },
  ];

  return (
    <Animated.View 
      style={[
        styles.sidebar, 
        { transform: [{ translateX: slideAnim }] }
      ]}
    >
      <LinearGradient
        colors={['#4a6cf7', '#2541b2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerText}>Menu</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => setSidebarVisible(false)}
        >
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.menuItems}>
        {sidebarItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.sidebarItem}
            onPress={() => navigateAndClose(item.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Icon name={item.icon} size={22} color="#4a6cf7" />
            </View>
            <Text style={styles.sidebarText}>{item.label}</Text>
            <Icon name="chevron-right" size={20} color="#aaa" />
          </TouchableOpacity>
        ))}
      </View>

     
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: width * 0.8,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  header: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomRightRadius: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  menuItems: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(74, 108, 247, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sidebarText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },

});

export default Sidebar;