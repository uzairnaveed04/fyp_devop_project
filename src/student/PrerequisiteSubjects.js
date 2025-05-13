// SubjectEnrollmentScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { db } from '../firebaseConfig.js';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

const SubjectEnrollmentScreen = ({ studentId }) => {
  const [enteredSubjects, setEnteredSubjects] = useState('');
  const [allSubjects, setAllSubjects] = useState([]);
  const [suggestedSubjects, setSuggestedSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all subjects from Firestore
  useEffect(() => {
    const loadSubjects = async () => {
      setIsLoading(true);
      try {
        const subjectsSnapshot = await getDocs(collection(db, 'subjects'));
        const subjects = subjectsSnapshot.docs.map(doc => doc.id);
        setAllSubjects(subjects);
      } catch (error) {
      alert('Error', 'Failed to load subjects');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubjects();
  }, []);

  // Update suggestions as user types
  useEffect(() => {
    if (enteredSubjects.length > 0) {
      const filtered = allSubjects.filter(subject =>
        subject.toLowerCase().includes(enteredSubjects.toLowerCase())
      );
      setSuggestedSubjects(filtered);
    } else {
      setSuggestedSubjects([]);
    }
  }, [enteredSubjects, allSubjects]);

  const checkPrerequisites = async () => {
    if (!enteredSubjects.trim()) {
     alert('Error', 'Please enter at least one subject');
      return;
    }

    setIsLoading(true);
    try {
      // Split by comma or newline and trim each subject
      const subjectsToCheck = enteredSubjects
        .split(/[,|\n]/)
        .map(subject => subject.trim())
        .filter(subject => subject.length > 0);

      const newResults = [];
      
      for (const subject of subjectsToCheck) {
        // Check if subject exists
        if (!allSubjects.includes(subject)) {
          newResults.push({
            subject,
            allowed: false,
            message: 'Invalid subject',
            validSubjects: allSubjects,
          });
          continue;
        }

        // Get student's completed subjects
        const studentDoc = await getDoc(doc(db, 'students', studentId));
        
        if (!studentDoc.exists()) {
          newResults.push({
            subject,
            allowed: false,
            message: 'Student not found',
            completedSubjects: [],
            requiredPrerequisites: []
          });
          continue;
        }

        const studentData = studentDoc.data();
        const completedSubjects = studentData.completedSubjects || [];

        // Get prerequisites
        const prereqDoc = await getDoc(doc(db, 'prerequisites', subject));
        
        if (!prereqDoc.exists()) {
          newResults.push({
            subject,
            allowed: true,
            message: 'No prerequisites required',
            completedSubjects,
            requiredPrerequisites: []
          });
          continue;
        }

        const prerequisites = prereqDoc.data().requiredSubjects || [];

        // Check prerequisites
        const hasAllPrerequisites = prerequisites.every(prereq => 
          completedSubjects.includes(prereq)
        );

        if (hasAllPrerequisites) {
          newResults.push({
            subject,
            allowed: true,
            message: 'All prerequisites satisfied',
            completedSubjects,
            requiredPrerequisites: prerequisites
          });
        } else {
          newResults.push({
            subject,
            allowed: false,
            message: 'Missing prerequisites',
            completedSubjects,
            requiredPrerequisites: prerequisites,
            missingPrerequisites: prerequisites.filter(prereq => 
              !completedSubjects.includes(prereq))
          });
        }
      }

      setResults(newResults);
    } catch (error) {
    alert('Error', 'Failed to check prerequisites');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectSelect = (subject) => {
    setEnteredSubjects(prev => {
      if (prev.length === 0) return subject;
      return `${prev}, ${subject}`;
    });
    setSuggestedSubjects([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Subject Enrollment</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter subject names (comma separated):</Text>
        <TextInput
          style={styles.largeInput}
          placeholder="e.g., PF, OOP, Database"
          value={enteredSubjects}
          onChangeText={setEnteredSubjects}
          multiline
          numberOfLines={4}
        />
        
        {suggestedSubjects.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionTitle}>Available Subjects:</Text>
            <FlatList
              data={suggestedSubjects}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSubjectSelect(item)}>
                  <Text style={styles.suggestionItem}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
        
        <Button
          title="CHECK ELIGIBILITY"
          onPress={checkPrerequisites}
          disabled={isLoading}
          color="#6200ee"
        />
      </View>

      {isLoading && <Text style={styles.loadingText}>Checking prerequisites...</Text>}

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Enrollment Results:</Text>
          
          {results.map((result, index) => (
            <View key={index} style={[
              styles.resultCard,
              result.allowed ? styles.allowedCard : styles.blockedCard
            ]}>
              <Text style={styles.subjectHeader}>{result.subject}</Text>
              <Text style={result.allowed ? styles.successText : styles.errorText}>
                {result.message}
              </Text>
              
              {!result.allowed && result.missingPrerequisites && (
                <View style={styles.prereqSection}>
                  <Text style={styles.sectionText}>Missing: {result.missingPrerequisites.join(', ')}</Text>
                </View>
              )}
              
              {result.requiredPrerequisites.length > 0 && (
                <View style={styles.prereqSection}>
                  <Text style={styles.sectionText}>Required: {result.requiredPrerequisites.join(', ')}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.allSubjectsContainer}>
        <Text style={styles.sectionTitle}>All Available Subjects:</Text>
        <View style={styles.subjectChipsContainer}>
          {allSubjects.map((subject, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.subjectChip}
              onPress={() => handleSubjectSelect(subject)}
            >
              <Text style={styles.chipText}>{subject}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#6200ee',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    color: '#333',
  },
  largeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  suggestionsContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    maxHeight: 150,
  },
  suggestionTitle: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  allowedCard: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 5,
    borderLeftColor: '#4caf50',
  },
  blockedCard: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 5,
    borderLeftColor: '#f44336',
  },
  subjectHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  successText: {
    color: '#4caf50',
    marginBottom: 5,
  },
  errorText: {
    color: '#f44336',
    marginBottom: 5,
  },
  prereqSection: {
    marginTop: 5,
  },
  sectionText: {
    fontSize: 14,
  },
  allSubjectsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subjectChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectChip: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 10,
    fontStyle: 'italic',
  },
});

export default SubjectEnrollmentScreen;