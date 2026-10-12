import { useState } from 'react';
import { Modal, View, Text, Button, Pressable, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (start: Date, end: Date) => void;
};

type Field = 'start' | 'end';

function formatDate(date: Date) {
  return date.toLocaleDateString('es-ES');
}

export default function DateRangeModal({ visible, onClose, onConfirm }: Props) {
  const [start, setStart] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [end, setEnd] = useState(() => new Date());
  const [editing, setEditing] = useState<Field>('start');

function handleChange(_event: unknown, selected?: Date) {
  if (!selected) return;
  if (editing === 'start') {
    setStart(selected);
  } else {
    setEnd(selected);
  }
}

  function handleConfirm() {
    const from = new Date(start);
    from.setHours(0, 0, 0, 0);
    const to = new Date(end);
    to.setHours(23, 59, 59, 999);
    onConfirm(from, to);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Elige un rango de fechas</Text>

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, editing === 'start' && styles.tabActive]}
            onPress={() => setEditing('start')}
          >
            <Text style={styles.tabLabel}>Desde</Text>
            <Text style={styles.tabDate}>{formatDate(start)}</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, editing === 'end' && styles.tabActive]}
            onPress={() => setEditing('end')}
          >
            <Text style={styles.tabLabel}>Hasta</Text>
            <Text style={styles.tabDate}>{formatDate(end)}</Text>
          </Pressable>
        </View>

        <DateTimePicker
          key={editing}
          value={editing === 'start' ? start : end}
          mode="date"
          display="inline"
          locale="es-ES"
          onValueChange={handleChange}
          minimumDate={editing === 'end' ? start : undefined}
          maximumDate={editing === 'start' ? end : new Date()}
        />

        <View style={styles.actions}>
          <Button title="Cancelar" onPress={onClose} />
          <Button title="Cargar fotos" onPress={handleConfirm} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  tabActive: {
    borderColor: '#007aff',
    backgroundColor: '#eaf3ff',
  },
  tabLabel: {
    fontSize: 13,
    color: '#666',
  },
  tabDate: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 'auto',
    marginBottom: 20,
  },
});