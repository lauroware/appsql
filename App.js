import React, { useState, useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";
import { Picker } from "@react-native-picker/picker";

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("db.db");
  return db;
}

const db = openDatabase();

function Items({ done: doneHeading, onPressItem }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from items where done = ?;`,
        [doneHeading ? 1 : 0],
        (_, { rows: { _array } }) => setItems(_array)
      );
    });
  }, []);

  const heading = doneHeading ? "Realizado" : "Todo";

  if (items === null || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeading}>{heading}</Text>
      {items.map(({ id, done, value }) => (
        <TouchableOpacity
          key={id}
          onPress={() => onPressItem && onPressItem(id)}
          style={{
            backgroundColor: done ? "#1c9963" : "#fff",
            borderColor: "#000",
            borderWidth: 1,
            padding: 8,
          }}
        >
          <Text style={{ color: done ? "#fff" : "#000" }}>{value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function App() {
  const [selectedExercise, setSelectedExercise] = useState("");
  const [forceUpdate, forceUpdateId] = useForceUpdate();

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, done int, value text);"
      );
    });
  }, []);

  const add = (exercise) => {
    if (exercise === "") {
      return false;
    }

    db.transaction(
      (tx) => {
        tx.executeSql("insert into items (done, value) values (0, ?)", [
          exercise,
        ]);
        tx.executeSql("select * from items", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      null,
      forceUpdate
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Listado de ejercicios a realizar</Text>

      {Platform.OS === "web" ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.heading}>
            Expo SQlite is not supported on web!
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.flexRow}>
            <Picker
              selectedValue={selectedExercise}
              onValueChange={(itemValue) => setSelectedExercise(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Elegir Ejercicio" value="" />
              <Picker.Item label="Burpies" value="Burpies" />
              <Picker.Item label="Dominadas" value="Dominadas" />
              <Picker.Item label="Patada de burro" value="Patada de burro" />
              <Picker.Item label="Sentadillas" value="Sentadillas" />
              <Picker.Item label="Peso muerto" value="Peso muerto" />
              <Picker.Item
                label="Puentes de gluteo"
                value="Puentes de gluteo"
              />
              <Picker.Item label="Constructores" value="Constructores" />
              <Picker.Item label="Estocadas" value="Estocadas" />
              <Picker.Item
                label="Estocadas Laterales"
                value="Estocadas laterales"
              />
              <Picker.Item
                label="Empujes en banco plano"
                value="Empujes en banco plano"
              />
              <Picker.Item label="Plancha" value="Plancha" />
              <Picker.Item label="Plancha lateral" value="Placha lateral" />
            </Picker>
            <TouchableOpacity
              onPress={() => {
                add(selectedExercise);
                setSelectedExercise("");
              }}
              style={styles.addButton}
            >
              <Text style={styles.buttonText}>Agregar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.listArea}>
            <Items
              key={`forceupdate-todo-${forceUpdateId}`}
              done={false}
              onPressItem={(id) =>
                db.transaction(
                  (tx) => {
                    tx.executeSql(`update items set done = 1 where id = ?;`, [
                      id,
                    ]);
                  },
                  null,
                  forceUpdate
                )
              }
            />
            <Items
              done
              key={`forceupdate-done-${forceUpdateId}`}
              onPressItem={(id) =>
                db.transaction(
                  (tx) => {
                    tx.executeSql(`delete from items where id = ?;`, [id]);
                  },
                  null,
                  forceUpdate
                )
              }
            />
          </ScrollView>
        </>
      )}
    </View>
  );
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    backgroundColor: "#000",
    width: "100%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  flexRow: {
    flexDirection: "row",
  },
  picker: {
    flex: 1,
    height: 48,
    margin: 16,
  },
  addButton: {
    backgroundColor: "#4630eb",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    height: 48,
    margin: 16,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listArea: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    paddingTop: 16,
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 18,
    marginBottom: 8,
  },
});
