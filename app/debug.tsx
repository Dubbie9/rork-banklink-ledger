import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trpcClient } from '@/lib/trpc';

export default function DebugScreen() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testBackend = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await trpcClient.example.hi.mutate({ name: 'Debug Test' });
      setDebugInfo({ type: 'hi', data: result });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testEnvVars = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await trpcClient.debug.env.query();
      setDebugInfo({ type: 'env', data: result });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testGoCardlessAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await trpcClient.gocardless.auth.getAccessToken.mutate();
      setDebugInfo({ type: 'gocardless', data: result });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testBanksFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      // First get access token
      const authResult = await trpcClient.gocardless.auth.getAccessToken.mutate();
      console.log('Auth successful:', authResult);
      
      // Then fetch institutions
      const banksResult = await trpcClient.gocardless.institutions.list.query({
        accessToken: authResult.access,
        country: 'gb'
      });
      
      setDebugInfo({ 
        type: 'banks', 
        data: { 
          auth: authResult, 
          banks: banksResult.slice(0, 5) // Show first 5 banks only
        } 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Backend Debug</Text>
        
        <TouchableOpacity style={styles.button} onPress={testBackend}>
          <Text style={styles.buttonText}>Test Backend (Hi)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testEnvVars}>
          <Text style={styles.buttonText}>Test Environment Variables</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testGoCardlessAuth}>
          <Text style={styles.buttonText}>Test GoCardless Auth</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testBanksFetch}>
          <Text style={styles.buttonText}>Test Banks Fetch (Full Flow)</Text>
        </TouchableOpacity>

        {loading && <Text style={styles.loading}>Loading...</Text>}
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        {debugInfo && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Result ({debugInfo.type}):</Text>
            <Text style={styles.resultText}>{JSON.stringify(debugInfo.data, null, 2)}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  resultContainer: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2e7d32',
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#1b5e20',
  },
});