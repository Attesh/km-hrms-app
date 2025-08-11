import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Header from "../components/Header";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import { BASE_URL } from "../config";

const { width } = Dimensions.get("window");

const EmployeeDetails = ({ route, navigation }) => {
  const { employeeId } = route.params;
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Animation values
  const positionAnim = useRef(new Animated.Value(0)).current;
  const tabContents = useRef({}).current;

  const tabs = useMemo(
    () => [
      { key: "profile", title: "Profile" },
      { key: "attendance", title: "Attendance" },
      { key: "leaves", title: "Leaves" },
      { key: "remarks", title: "Remarks" },
    ],
    []
  );

  useEffect(() => {
    let isMounted = true;
    const source = axios.CancelToken.source();

    const fetchEmployeeDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          `${BASE_URL}/employees/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cancelToken: source.token,
          }
        );

        if (isMounted) {
          if (response.data.success) {
            setEmployee(response.data.data);
          } else {
            setError("Failed to fetch employee details");
          }
        }
      } catch (err) {
        if (isMounted && !axios.isCancel(err)) {
          setError(err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEmployeeDetails();

    return () => {
      isMounted = false;
      source.cancel("Component unmounted");
    };
  }, [employeeId]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleTabChange = useCallback(
    (tabKey) => {
      const newIndex = tabs.findIndex((tab) => tab.key === tabKey);
      const currentIndex = tabs.findIndex((tab) => tab.key === activeTab);

      if (newIndex === currentIndex) return;

      // Immediately update the active tab to prevent flickering
      setActiveTab(tabKey);

      // Animate the position indicator
      Animated.spring(positionAnim, {
        toValue: newIndex,
        useNativeDriver: true,
      }).start();
    },
    [activeTab, tabs, positionAnim]
  );

  const renderTabContent = (tabKey) => {
    if (!employee) return null;

    switch (tabKey) {
      case "profile":
        return (
          <ScrollView contentContainerStyle={styles.tabContent}>
            <View style={styles.infoCard}>
              {/* Profile content */}
              <View style={styles.infoRow}>
                <Icon
                  name="person"
                  size={20}
                  color="#666"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>{employee?.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon
                  name="work"
                  size={20}
                  color="#666"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>{employee?.designation}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon
                  name="business"
                  size={20}
                  color="#666"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>{employee?.department}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon
                  name="event"
                  size={20}
                  color="#666"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  Joined on{" "}
                  {employee?.date_of_joining
                    ? format(new Date(employee.date_of_joining), "dd MMM yyyy")
                    : "N/A"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon
                  name="attach-money"
                  size={20}
                  color="#666"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  Salary: {employee?.joining_salary || "N/A"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon
                  name="email"
                  size={20}
                  color="#666"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  {employee?.contact_info?.email || "N/A"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon
                  name="phone"
                  size={20}
                  color="#666"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  {employee?.contact_info?.phone || "N/A"}
                </Text>
              </View>

              {/* Profile content end */}
            </View>
          </ScrollView>
        );
      case "attendance":
        return (
          <ScrollView contentContainerStyle={styles.tabContent}>
            {/* Attendance content */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {employee?.attendance_stats?.present || 0}
                </Text>
                <Text style={styles.statLabel}>Days Present</Text>
              </View>
              <View style={[styles.statCard, styles.absentCard]}>
                <Text style={styles.statNumber}>
                  {employee?.attendance_stats?.absent || 0}
                </Text>
                <Text style={styles.statLabel}>Days Absent</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Attendance History</Text>
            <View style={styles.historyCard}>
              <Text style={styles.historyText}>
                Detailed attendance history would be displayed here
              </Text>
            </View>
            {/* Attendance content end */}
          </ScrollView>
        );
      case "leaves":
        return (
          <ScrollView contentContainerStyle={styles.tabContent}>
            {/* Leaves content */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {employee?.leave_stats?.approved || 0}
                </Text>
                <Text style={styles.statLabel}>Approved Leaves</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {employee?.leave_stats?.paid || 0}
                </Text>
                <Text style={styles.statLabel}>Paid Leaves</Text>
              </View>
              <View style={[styles.statCard, styles.absentCard]}>
                <Text style={styles.statNumber}>
                  {employee?.leave_stats?.unpaid || 0}
                </Text>
                <Text style={styles.statLabel}>Unpaid Leaves</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Recent Leave Requests</Text>
            {employee?.leave_requests?.length > 0 ? (
              employee.leave_requests.map((leave, idx) => (
                <View key={`leave-${idx}`} style={styles.leaveCard}>
                  <View style={styles.leaveHeader}>
                    <Text style={styles.leaveDate}>
                      {format(new Date(leave.start_date), "dd MMM")} -{" "}
                      {format(new Date(leave.end_date), "dd MMM yyyy")}
                    </Text>
                    <View
                      style={[
                        styles.leaveStatus,
                        leave.status === "approved"
                          ? styles.approvedStatus
                          : styles.pendingStatus,
                      ]}
                    >
                      <Text style={styles.leaveStatusText}>{leave.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.leaveType}>{leave.type} Leave</Text>
                  <Text style={styles.leaveReason}>{leave.reason}</Text>
                </View>
              ))
            ) : (
              <View style={styles.noDataCard}>
                <Text style={styles.noDataText}>No leave requests found</Text>
              </View>
            )}
            {/* Leaves content end */}
          </ScrollView>
        );
      case "remarks":
        return (
          <ScrollView contentContainerStyle={styles.tabContent}>
            {/* Remarks content */}
            <View style={styles.remarksCard}>
              <Text style={styles.remarksText}>
                {employee?.remarks || "No remarks available"}
              </Text>
            </View>
            {/* Remarks content end */}
          </ScrollView>
        );
      default:
        return null;
    }
  };

  const renderTabBar = () => {
    const tabWidth = width / tabs.length;

    return (
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => handleTabChange(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              width: tabWidth,
              transform: [
                {
                  translateX: positionAnim.interpolate({
                    inputRange: tabs.map((_, i) => i),
                    outputRange: tabs.map((_, i) => i * tabWidth),
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <Header
        title="Employee Details"
        onBackPress={handleBackPress}
        showBackButton
      />

      {employee && (
        <>
          <View style={styles.profileHeader}>
            <Image
              source={{
                uri:
                  employee?.profile_image || "https://via.placeholder.com/150",
              }}
              style={styles.profileImage}
              defaultSource={require("../assets/placeholder.png")}
            />
            <Text style={styles.employeeName}>{employee?.name}</Text>
            <Text style={styles.employeeId}>ID: {employee?.employee_id}</Text>
            <View
              style={[
                styles.statusBadge,
                employee?.is_blocked ? styles.blockedBadge : styles.activeBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {employee?.is_blocked ? "Blocked" : "Active"}
              </Text>
            </View>
          </View>

          {renderTabBar()}

          <View style={styles.tabContentContainer}>
            {renderTabContent(activeTab)}
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  tabBarContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  tabBar: {
    flexDirection: "row",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
  },
  tabText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#007bff",
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 2,
    backgroundColor: "#007bff",
  },
  tabContentContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabContent: {
    flexGrow: 1,
    padding: 16,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#007bff",
  },
  employeeName: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },
  employeeId: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: "#e1f5fe",
  },
  blockedBadge: {
    backgroundColor: "#ffebee",
  },
  statusText: {
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  // ... include all other necessary styles
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
    width: 24,
  },
  infoText: {
    fontSize: 16,
    color: "#444",
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    width: "30%",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  absentCard: {
    backgroundColor: "#ffebee",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyText: {
    color: "#666",
  },
  leaveCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leaveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  leaveDate: {
    fontWeight: "500",
    color: "#333",
  },
  leaveStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  approvedStatus: {
    backgroundColor: "#e8f5e9",
  },
  pendingStatus: {
    backgroundColor: "#fff8e1",
  },
  leaveStatusText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  leaveType: {
    color: "#007bff",
    marginBottom: 4,
    fontWeight: "500",
  },
  leaveReason: {
    color: "#666",
    fontStyle: "italic",
  },
  noDataCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noDataText: {
    color: "#999",
  },
  remarksCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  remarksText: {
    color: "#333",
    lineHeight: 22,
  },
  error: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    color: "red",
    padding: 20,
    fontSize: 16,
  },
});

export default EmployeeDetails;
