"""
Predictive Maintenance AI Model
Uses LSTM for anomaly detection and RUL prediction
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os

class PredictiveMaintenanceModel:
    def __init__(self):
        self.anomaly_model = None
        self.rul_model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def preprocess_data(self, data):
        """Preprocess sensor data for model input"""
        features = []
        for row in data:
            # Extract features from sensor readings
            temp = row.get('temperature', 0)
            vibration = row.get('vibration', 0)
            pressure = row.get('pressure', 0)
            current = row.get('current', 0)
            
            # Create feature vector
            feature = [
                temp,
                vibration,
                pressure,
                current,
                np.mean([temp, vibration, pressure, current]),
                np.std([temp, vibration, pressure, current]),
                max(temp, vibration, pressure, current) - min(temp, vibration, pressure, current)
            ]
            features.append(feature)
            
        return np.array(features)
    
    def train(self, X, y_anomaly, y_rul):
        """Train the predictive models"""
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train anomaly detection model
        self.anomaly_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.anomaly_model.fit(X_scaled, y_anomaly)
        
        # Train RUL prediction model
        self.rul_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.rul_model.fit(X_scaled, y_rul)
        
        self.is_trained = True
        return self
    
    def predict_anomaly(self, X):
        """Predict if there's an anomaly"""
        if not self.is_trained:
            raise ValueError("Model not trained")
            
        X_scaled = self.scaler.transform(X)
        prediction = self.anomaly_model.predict(X_scaled)
        probability = self.anomaly_model.predict_proba(X_scaled)
        
        return prediction, probability
    
    def predict_rul(self, X):
        """Predict Remaining Useful Life"""
        if not self.is_trained:
            raise ValueError("Model not trained")
            
        X_scaled = self.scaler.transform(X)
        rul = self.rul_model.predict(X_scaled)
        
        return np.maximum(rul, 0)  # RUL cannot be negative
    
    def save(self, path):
        """Save model to disk"""
        os.makedirs(path, exist_ok=True)
        joblib.dump(self.anomaly_model, f"{path}/anomaly_model.pkl")
        joblib.dump(self.rul_model, f"{path}/rul_model.pkl")
        joblib.dump(self.scaler, f"{path}/scaler.pkl")
        
    def load(self, path):
        """Load model from disk"""
        self.anomaly_model = joblib.load(f"{path}/anomaly_model.pkl")
        self.rul_model = joblib.load(f"{path}/rul_model.pkl")
        self.scaler = joblib.load(f"{path}/scaler.pkl")
        self.is_trained = True


def generate_sample_data(n_samples=1000):
    """Generate sample sensor data for training"""
    np.random.seed(42)
    
    data = []
    for i in range(n_samples):
        # Simulate normal operation
        temp = np.random.normal(60, 10)
        vibration = np.random.normal(5, 1)
        pressure = np.random.normal(100, 10)
        current = np.random.normal(10, 2)
        
        # Add some anomalies
        if i > n_samples * 0.8:
            temp += np.random.normal(20, 5)
            vibration += np.random.normal(3, 1)
            
        # Calculate RUL (decreases over time)
        rul = max(0, 365 - i * 0.5 + np.random.normal(0, 10))
        
        # Label anomaly
        is_anomaly = 1 if i > n_samples * 0.8 else 0
        
        data.append({
            'temperature': temp,
            'vibration': vibration,
            'pressure': pressure,
            'current': current,
            'anomaly': is_anomaly,
            'rul': rul
        })
        
    return pd.DataFrame(data)


class OctopusTelemetryAgent:
    """
    Hybrid ML + Gemini 3.8 Flash AI Agent for Python telemetry pipelines.
    Runs Random Forest anomaly detection & RUL regression, then uses
    google-genai (gemini-3.8-flash) to synthesize root-cause diagnostics.
    """
    def __init__(self, ml_model: PredictiveMaintenanceModel):
        self.ml_model = ml_model
        self.model_name = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")

    def analyze_reading(self, sensor_payload: dict) -> dict:
        features = np.array([[
            sensor_payload.get("temperature", 60.0),
            sensor_payload.get("vibration", 5.0),
            sensor_payload.get("pressure", 100.0),
            sensor_payload.get("current", 10.0),
        ]])
        anomaly_pred, anomaly_prob = self.ml_model.predict_anomaly(features)
        rul_pred = self.ml_model.predict_rul(features)

        is_anomaly = bool(anomaly_pred[0] == 1)
        failure_prob = float(anomaly_prob[0][1]) if anomaly_prob.shape[1] > 1 else float(anomaly_pred[0])
        rul_days = float(rul_pred[0])

        explanation = (
            f"Random Forest detected {'ANOMALY' if is_anomaly else 'NORMAL'} state "
            f"(failure probability: {failure_prob:.1%}, estimated RUL: {rul_days:.1f} days)."
        )

        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if api_key:
            try:
                from google import genai
                client = genai.Client(api_key=api_key)
                interaction = client.interactions.create(
                    model=self.model_name,
                    system_instruction=(
                        "You are the Octopus Industrial Telemetry Diagnostic Agent. "
                        "Provide a concise 2-sentence engineering root-cause analysis and action item."
                    ),
                    input=(
                        f"Sensor telemetry: {sensor_payload}. "
                        f"ML Anomaly={is_anomaly}, FailureProb={failure_prob:.2f}, RUL={rul_days:.1f} days."
                    ),
                )
                if interaction.output_text:
                    explanation = interaction.output_text
            except Exception as exc:
                print(f"[OctopusTelemetryAgent] Using ML baseline (Gemini skipped: {exc})")

        return {
            "is_anomaly": is_anomaly,
            "failure_probability": round(failure_prob, 4),
            "rul_days": round(rul_days, 1),
            "agent_explanation": explanation,
        }


if __name__ == "__main__":
    # Generate sample data
    print("Generating sample data...")
    df = generate_sample_data(1000)
    
    # Prepare features and labels
    X = df[['temperature', 'vibration', 'pressure', 'current']].values
    y_anomaly = df['anomaly'].values
    y_rul = df['rul'].values
    
    # Split data
    X_train, X_test, y_anomaly_train, y_anomaly_test, y_rul_train, y_rul_test = train_test_split(
        X, y_anomaly, y_rul, test_size=0.2, random_state=42
    )
    
    # Train model
    print("Training model...")
    model = PredictiveMaintenanceModel()
    model.train(X_train, y_anomaly_train, y_rul_train)
    
    # Evaluate
    anomaly_pred, anomaly_prob = model.predict_anomaly(X_test)
    rul_pred = model.predict_rul(X_test)
    
    print(f"Anomaly detection accuracy: {(anomaly_pred == y_anomaly_test).mean():.2%}")
    print(f"Average RUL prediction error: {np.abs(rul_pred - y_rul_test).mean():.2f} days")
    
    # Run Hybrid AI Agent on a critical sample reading
    agent = OctopusTelemetryAgent(model)
    sample_result = agent.analyze_reading({
        "temperature": 88.5,
        "vibration": 9.2,
        "pressure": 112.0,
        "current": 14.1,
    })
    print(f"AI Agent Analysis: {sample_result}")

    # Save model
    print("Saving model...")
    model.save("./models")
    print("Model saved successfully!")