#include <ArduinoBLE.h>

const int CAP_DRIVE = A7;
const int CAP_IN = A0;
const int ECG_IN = A1;
const int EOG_IN = A2;
const int EMG_IN = A3;

unsigned long read_time = 0; // time when read
int CAP_val = 0; // value read from ADC
int ECG_val = 0; // value read from ADC
int EOG_val = 0; // value read from ADC
int EMG_val = 0; // value read from ADC

//BLE setup
BLEService ADC_read_service("00001234-0000-0000-0001-000000000000");
BLEUnsignedLongCharacteristic Time_chara("00001234-0000-0000-0001-000000000001", BLERead | BLENotify);
BLELongCharacteristic CAP_chara("00001234-0000-0000-0001-000000000002", BLERead | BLENotify);
BLELongCharacteristic ECG_chara("00001234-0000-0000-0001-000000000003", BLERead | BLENotify);
BLELongCharacteristic EOG_chara("00001234-0000-0000-0001-000000000004", BLERead | BLENotify);
BLELongCharacteristic EMG_chara("00001234-0000-0000-0001-000000000005", BLERead | BLENotify);

//Capacitance between CAP_IN and Ground
//Stray capacitance is always present. Extra capacitance can be added to
//allow higher capacitance to be measured.
/* move the capacitance value calculation to the front-end
const float IN_STRAY_CAP_TO_GND = 1517.53; //initially this was 30.00
const float IN_EXTRA_CAP_TO_GND = 0.0;
const float IN_CAP_TO_GND  = IN_STRAY_CAP_TO_GND + IN_EXTRA_CAP_TO_GND;
const int MAX_ADC_VALUE = 1023;
*/
void setup() 
{
  pinMode(CAP_DRIVE, OUTPUT);
  //digitalWrite(CAP_DRIVE, LOW);  //This is the default state for outputs
  pinMode(CAP_IN, OUTPUT);
  //digitalWrite(CAP_IN, LOW);
  pinMode(ECG_IN, INPUT);
  pinMode(EOG_IN, INPUT);
  pinMode(EMG_IN, INPUT);

  Serial.begin(115200);
  while (!Serial);

  //enable BLE
  if (!BLE.begin()) {
    Serial.println("starting BLE failed!");
    while (1);
  }
  // set advertised local name and service UUID:
  BLE.setLocalName("Arduino");
  BLE.setAdvertisedService(ADC_read_service);

  // add the characteristic to the service
  ADC_read_service.addCharacteristic(Time_chara);
  ADC_read_service.addCharacteristic(CAP_chara);
  ADC_read_service.addCharacteristic(ECG_chara);
  ADC_read_service.addCharacteristic(EOG_chara);
  ADC_read_service.addCharacteristic(EMG_chara);

  // add service
  BLE.addService(ADC_read_service);
  
  // set the initial value for the characeristic:
  Time_chara.writeValue(0);
  CAP_chara.writeValue(0);
  ECG_chara.writeValue(0);
  EOG_chara.writeValue(0);
  EMG_chara.writeValue(0);
  // start advertising
  BLE.advertise();
}

void loop() 
{
  //Clear everything for next measurement
  digitalWrite(CAP_DRIVE, LOW);
  pinMode(CAP_IN, OUTPUT);

  // listen for BLE peripherals to connect:
  BLEDevice central = BLE.central();
  
  // average and send every 10 reads
  int count = 0;
  // if a central is connected to peripheral:
  if (central) 
  {
    Serial.print("Connected to central: ");
    // print the central's MAC address:
    Serial.println(central.address());

    // while the central is still connected to peripheral:
    while (central.connected()) 
    {
      // read every 1ms
      while (micros() % 1000 != 0);

      //Capacitor under test between CAP_DRIVE and CAP_IN
      //Rising high edge on CAP_DRIVE
      pinMode(CAP_IN, INPUT);
      digitalWrite(CAP_DRIVE, HIGH);
      CAP_val = CAP_val + analogRead(CAP_IN);

      //read ECG EOG EMG
      ECG_val = ECG_val + analogRead(ECG_IN);
      EOG_val = EOG_val + analogRead(EOG_IN);
      EMG_val = EMG_val + analogRead(EMG_IN);

      //Clear everything for next measurement
      digitalWrite(CAP_DRIVE, LOW);
      pinMode(CAP_IN, OUTPUT);

      count = count + 1;

      /*
      //Calculate and print result
      float capacitance = (float)CAP_val * IN_CAP_TO_GND / (float)(MAX_ADC_VALUE - CAP_val);

      Serial.print(F("Capacitance Value = "));
      Serial.print(capacitance, 3);
      Serial.print(F(" pF ("));
      Serial.print(CAP_val);
      Serial.println(F(") "));
      */

      // send every 100ms
      if (count == 100)
      {
        read_time = millis();
        //BLE write
        Time_chara.writeValue(read_time);
        CAP_chara.writeValue(CAP_val/100);
        ECG_chara.writeValue(ECG_val/100);
        EOG_chara.writeValue(EOG_val/100);
        EMG_chara.writeValue(EMG_val/100);
        // reset
        CAP_val = 0;
        ECG_val = 0;
        EOG_val = 0;
        EMG_val = 0;
        count = 0;
      }
    }
    // when the central disconnects, print it out:
    Serial.print(F("Disconnected from central: "));
    Serial.println(central.address());
  }
    
}
