import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Tabs } from 'expo-router';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

function HeaderRight() {
    const { user } = useAuth();

    return (
        <View style={styles.headerRight}>
            <TouchableOpacity
                style={styles.postJobButton}
                onPress={() => router.push('/post-a-job')}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.postJobGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons name="add" size={20} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

export default function TabLayout() {
    return (
        <Tabs 
            screenOptions={{ 
                tabBarActiveTintColor: '#667eea',
                tabBarInactiveTintColor: '#8e8e93',
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarIconStyle: styles.tabBarIcon,
                headerRight: () => HeaderRight(),
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitle,
                headerShadowVisible: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabIconContainer, focused && styles.activeTabIconContainer]}>
                            <Ionicons 
                                name={focused ? "home" : "home-outline"} 
                                size={24} 
                                color={color} 
                            />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="reviews"
                options={{
                    title: 'Reviews',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabIconContainer, focused && styles.activeTabIconContainer]}>
                            <Ionicons 
                                name={focused ? "star" : "star-outline"} 
                                size={24} 
                                color={color} 
                            />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'Messages',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabIconContainer, focused && styles.activeTabIconContainer]}>
                            <Ionicons 
                                name={focused ? "chatbubbles" : "chatbubbles-outline"} 
                                size={24} 
                                color={color} 
                            />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabIconContainer, focused && styles.activeTabIconContainer]}>
                            <Ionicons 
                                name={focused ? "person" : "person-outline"} 
                                size={24} 
                                color={color} 
                            />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#fff',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginRight: 15,
        gap: 12,
    },
    postJobButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#667eea',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    postJobGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBar: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        height: Platform.OS === 'ios' ? 88 : 60,
        paddingBottom: Platform.OS === 'ios' ? 30 : 8,
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    tabBarIcon: {
        marginTop: 4,
    },
    tabIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    activeTabIconContainer: {
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
    },
});