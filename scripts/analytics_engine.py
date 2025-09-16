#!/usr/bin/env python3
"""
Advanced Data Analytics and Machine Learning for Traveal
Government-grade travel pattern analysis and insights
"""

import os
import json
import numpy as np
import pandas as pd
import sqlite3
import pymongo
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass
import secrets
import hashlib

# ML and Analytics imports
try:
    from sklearn.cluster import DBSCAN, KMeans
    from sklearn.preprocessing import StandardScaler, LabelEncoder
    from sklearn.ensemble import RandomForestClassifier, IsolationForest
    from sklearn.metrics import silhouette_score, classification_report
    from sklearn.model_selection import train_test_split
    import matplotlib.pyplot as plt
    import seaborn as sns
    from geopy.distance import geodesic
    import folium
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("Warning: ML libraries not available. Install with: pip install -r requirements.txt")

from encryption_utils import TravealCrypto, TravealDataProcessor


@dataclass
class TripPattern:
    """Data class for trip patterns"""
    origin_cluster: int
    destination_cluster: int
    mode: str
    purpose: str
    frequency: int
    avg_distance: float
    avg_duration: float
    time_patterns: List[int]  # Hours of day
    day_patterns: List[int]   # Days of week


class TravealAnalytics:
    """Advanced analytics engine for travel data"""
    
    def __init__(self, 
                 db_connection=None, 
                 crypto_key: Optional[str] = None,
                 enable_ml: bool = True):
        """Initialize analytics engine"""
        self.db = db_connection
        self.crypto = TravealCrypto(crypto_key)
        self.data_processor = TravealDataProcessor(self.crypto)
        self.enable_ml = enable_ml and ML_AVAILABLE
        self.scaler = StandardScaler() if self.enable_ml else None
        self.location_clusters = {}
        self.trip_patterns = []
        
    def connect_to_database(self, db_type: str = "mongodb", connection_string: str = None):
        """Connect to database"""
        if db_type == "mongodb":
            try:
                self.db = pymongo.MongoClient(connection_string or "mongodb://localhost:27017/")
                print("✓ Connected to MongoDB")
            except Exception as e:
                print(f"MongoDB connection failed: {e}")
        elif db_type == "sqlite":
            try:
                self.db = sqlite3.connect(connection_string or "traveal.db")
                print("✓ Connected to SQLite")
            except Exception as e:
                print(f"SQLite connection failed: {e}")
    
    def extract_trip_data(self, 
                         anonymize: bool = True,
                         date_range: Tuple[datetime, datetime] = None) -> pd.DataFrame:
        """Extract and preprocess trip data"""
        if not self.db:
            raise ValueError("No database connection available")
        
        # MongoDB extraction
        if hasattr(self.db, 'list_database_names'):  # MongoDB
            traveal_db = self.db.traveal
            trips_collection = traveal_db.trips
            
            query = {}
            if date_range:
                query['createdAt'] = {
                    '$gte': date_range[0],
                    '$lte': date_range[1]
                }
            
            trips = list(trips_collection.find(query))
            
            # Convert to DataFrame
            if not trips:
                return pd.DataFrame()
            
            df = pd.DataFrame(trips)
            
        else:  # SQLite
            query = """
            SELECT * FROM trips 
            WHERE createdAt >= ? AND createdAt <= ?
            """ if date_range else "SELECT * FROM trips"
            
            params = (date_range[0], date_range[1]) if date_range else ()
            df = pd.read_sql_query(query, self.db, params=params)
        
        if df.empty:
            return df
        
        # Anonymize data if requested
        if anonymize:
            anonymized_data = []
            for _, row in df.iterrows():
                trip_data = row.to_dict()
                anonymized = self.data_processor.anonymize_trip_data(trip_data)
                anonymized_data.append(anonymized)
            
            df = pd.DataFrame(anonymized_data)
        
        return df
    
    def analyze_location_clusters(self, 
                                df: pd.DataFrame,
                                cluster_radius: float = 0.1) -> Dict[str, Any]:
        """Identify common locations using DBSCAN clustering"""
        if not self.enable_ml or df.empty:
            return {}
        
        # Extract location data
        locations = []
        for _, row in df.iterrows():
            if 'start_area' in row and row['start_area']:
                start = row['start_area']
                locations.append([start['lat_zone'], start['lng_zone'], 'start'])
            if 'end_area' in row and row['end_area']:
                end = row['end_area']
                locations.append([end['lat_zone'], end['lng_zone'], 'end'])
        
        if len(locations) < 10:
            return {"error": "Insufficient location data for clustering"}
        
        location_df = pd.DataFrame(locations, columns=['lat', 'lng', 'type'])
        
        # DBSCAN clustering
        coords = location_df[['lat', 'lng']].values
        dbscan = DBSCAN(eps=cluster_radius, min_samples=5)
        clusters = dbscan.fit_predict(coords)
        
        location_df['cluster'] = clusters
        
        # Analyze clusters
        cluster_analysis = {}
        for cluster_id in set(clusters):
            if cluster_id == -1:  # Noise points
                continue
            
            cluster_points = location_df[location_df['cluster'] == cluster_id]
            cluster_analysis[f'cluster_{cluster_id}'] = {
                'center': {
                    'lat': cluster_points['lat'].mean(),
                    'lng': cluster_points['lng'].mean()
                },
                'point_count': len(cluster_points),
                'start_trips': len(cluster_points[cluster_points['type'] == 'start']),
                'end_trips': len(cluster_points[cluster_points['type'] == 'end']),
                'radius': cluster_points[['lat', 'lng']].std().mean()
            }
        
        self.location_clusters = cluster_analysis
        
        return {
            'total_clusters': len(cluster_analysis),
            'clustered_points': len(location_df[location_df['cluster'] != -1]),
            'noise_points': len(location_df[location_df['cluster'] == -1]),
            'clusters': cluster_analysis,
            'silhouette_score': silhouette_score(coords, clusters) if len(set(clusters)) > 1 else 0
        }
    
    def analyze_trip_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze temporal and behavioral trip patterns"""
        if df.empty:
            return {}
        
        analysis = {
            'temporal_patterns': {},
            'mode_distribution': {},
            'purpose_distribution': {},
            'distance_statistics': {},
            'duration_statistics': {}
        }
        
        # Temporal patterns
        if 'start_hour' in df.columns:
            df['hour'] = pd.to_datetime(df['start_hour']).dt.hour
            df['day_of_week'] = pd.to_datetime(df['start_hour']).dt.dayofweek
            
            analysis['temporal_patterns'] = {
                'peak_hours': df['hour'].value_counts().head(5).to_dict(),
                'day_distribution': df['day_of_week'].value_counts().to_dict(),
                'hourly_average': df.groupby('hour').size().mean()
            }
        
        # Mode distribution
        if 'mode' in df.columns:
            analysis['mode_distribution'] = df['mode'].value_counts().to_dict()
        
        # Purpose distribution
        if 'purpose' in df.columns:
            analysis['purpose_distribution'] = df['purpose'].value_counts().to_dict()
        
        # Distance statistics
        if 'distance' in df.columns:
            distance_stats = df['distance'].describe()
            analysis['distance_statistics'] = {
                'mean': distance_stats['mean'],
                'median': distance_stats['50%'],
                'std': distance_stats['std'],
                'min': distance_stats['min'],
                'max': distance_stats['max']
            }
        
        # Duration statistics
        if 'duration' in df.columns:
            duration_stats = df['duration'].describe()
            analysis['duration_statistics'] = {
                'mean': duration_stats['mean'],
                'median': duration_stats['50%'],
                'std': duration_stats['std'],
                'min': duration_stats['min'],
                'max': duration_stats['max']
            }
        
        return analysis
    
    def detect_anomalies(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Detect unusual trip patterns using Isolation Forest"""
        if not self.enable_ml or df.empty:
            return {}
        
        # Prepare features for anomaly detection
        features = []
        feature_names = []
        
        if 'distance' in df.columns:
            features.append(df['distance'].fillna(df['distance'].median()))
            feature_names.append('distance')
        
        if 'duration' in df.columns:
            features.append(df['duration'].fillna(df['duration'].median()))
            feature_names.append('duration')
        
        if 'hour' in df.columns:
            features.append(df['hour'].fillna(12))
            feature_names.append('hour')
        
        if len(features) < 2:
            return {"error": "Insufficient features for anomaly detection"}
        
        feature_matrix = np.column_stack(features)
        
        # Isolation Forest
        iso_forest = IsolationForest(
            contamination=0.1,  # Expect 10% anomalies
            random_state=42
        )
        
        anomaly_labels = iso_forest.fit_predict(feature_matrix)
        anomaly_scores = iso_forest.score_samples(feature_matrix)
        
        # Add results to dataframe
        df_with_anomalies = df.copy()
        df_with_anomalies['is_anomaly'] = anomaly_labels == -1
        df_with_anomalies['anomaly_score'] = anomaly_scores
        
        anomalies = df_with_anomalies[df_with_anomalies['is_anomaly']]
        
        return {
            'total_trips': len(df),
            'anomalies_detected': len(anomalies),
            'anomaly_percentage': (len(anomalies) / len(df)) * 100,
            'anomaly_details': {
                'avg_distance': anomalies['distance'].mean() if 'distance' in anomalies else 0,
                'avg_duration': anomalies['duration'].mean() if 'duration' in anomalies else 0,
                'most_common_mode': anomalies['mode'].mode().iloc[0] if 'mode' in anomalies and not anomalies['mode'].empty else 'unknown'
            }
        }
    
    def predict_trip_purpose(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Predict trip purpose using machine learning"""
        if not self.enable_ml or df.empty or 'purpose' not in df.columns:
            return {}
        
        # Prepare features
        features = []
        feature_names = []
        
        if 'distance' in df.columns:
            features.append('distance')
        if 'duration' in df.columns:
            features.append('duration')
        if 'hour' in df.columns:
            features.append('hour')
        if 'day_of_week' in df.columns:
            features.append('day_of_week')
        if 'companions' in df.columns:
            features.append('companions')
        
        if len(features) < 2:
            return {"error": "Insufficient features for purpose prediction"}
        
        # Prepare data
        df_clean = df[features + ['purpose']].dropna()
        
        if len(df_clean) < 50:
            return {"error": "Insufficient data for training"}
        
        X = df_clean[features]
        y = df_clean['purpose']
        
        # Encode labels
        label_encoder = LabelEncoder()
        y_encoded = label_encoder.fit_transform(y)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        # Train Random Forest
        rf_model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            max_depth=10
        )
        
        rf_model.fit(X_train, y_train)
        
        # Predictions
        y_pred = rf_model.predict(X_test)
        
        # Feature importance
        feature_importance = dict(zip(features, rf_model.feature_importances_))
        
        return {
            'model_accuracy': rf_model.score(X_test, y_test),
            'feature_importance': feature_importance,
            'classification_report': classification_report(
                y_test, y_pred, 
                target_names=label_encoder.classes_,
                output_dict=True
            ),
            'prediction_confidence': rf_model.predict_proba(X_test).max(axis=1).mean()
        }
    
    def generate_insights_report(self, 
                               df: pd.DataFrame,
                               save_path: Optional[str] = None) -> Dict[str, Any]:
        """Generate comprehensive insights report"""
        
        print("🔍 Analyzing travel data...")
        
        report = {
            'metadata': {
                'analysis_date': datetime.utcnow().isoformat(),
                'total_trips': len(df),
                'date_range': {
                    'start': df['start_hour'].min() if 'start_hour' in df else None,
                    'end': df['start_hour'].max() if 'start_hour' in df else None
                } if not df.empty else None,
                'ml_enabled': self.enable_ml
            },
            'location_analysis': {},
            'pattern_analysis': {},
            'anomaly_analysis': {},
            'prediction_analysis': {}
        }
        
        if not df.empty:
            # Location clustering
            print("📍 Analyzing location clusters...")
            report['location_analysis'] = self.analyze_location_clusters(df)
            
            # Pattern analysis
            print("📊 Analyzing trip patterns...")
            report['pattern_analysis'] = self.analyze_trip_patterns(df)
            
            # Anomaly detection
            if self.enable_ml:
                print("🚨 Detecting anomalies...")
                report['anomaly_analysis'] = self.detect_anomalies(df)
                
                # Purpose prediction
                print("🎯 Training purpose prediction model...")
                report['prediction_analysis'] = self.predict_trip_purpose(df)
        
        # Generate recommendations
        report['recommendations'] = self._generate_recommendations(report)
        
        # Save report if path provided
        if save_path:
            with open(save_path, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            print(f"📄 Report saved to {save_path}")
        
        return report
    
    def _generate_recommendations(self, report: Dict[str, Any]) -> List[str]:
        """Generate actionable recommendations based on analysis"""
        recommendations = []
        
        # Location-based recommendations
        if 'location_analysis' in report and 'clusters' in report['location_analysis']:
            cluster_count = report['location_analysis']['total_clusters']
            if cluster_count > 10:
                recommendations.append(
                    f"Consider establishing {cluster_count} strategic transit hubs "
                    "based on identified high-activity location clusters."
                )
        
        # Pattern-based recommendations
        if 'pattern_analysis' in report and 'temporal_patterns' in report['pattern_analysis']:
            peak_hours = report['pattern_analysis']['temporal_patterns'].get('peak_hours', {})
            if peak_hours:
                peak_hour = max(peak_hours, key=peak_hours.get)
                recommendations.append(
                    f"Peak travel hour is {peak_hour}:00. Consider increasing "
                    "public transport capacity during this time."
                )
        
        # Mode distribution recommendations
        if 'pattern_analysis' in report and 'mode_distribution' in report['pattern_analysis']:
            modes = report['pattern_analysis']['mode_distribution']
            if 'car' in modes and modes['car'] > sum(modes.values()) * 0.7:
                recommendations.append(
                    "High car usage detected. Consider incentivizing public transport "
                    "and developing cycling infrastructure."
                )
        
        # Anomaly-based recommendations
        if 'anomaly_analysis' in report and 'anomaly_percentage' in report['anomaly_analysis']:
            anomaly_rate = report['anomaly_analysis']['anomaly_percentage']
            if anomaly_rate > 15:
                recommendations.append(
                    f"High anomaly rate ({anomaly_rate:.1f}%) suggests data quality issues "
                    "or unusual travel patterns requiring investigation."
                )
        
        return recommendations
    
    def export_anonymized_data(self, 
                             df: pd.DataFrame,
                             format: str = 'csv',
                             output_path: str = None) -> str:
        """Export anonymized data for research purposes"""
        
        # Ensure data is properly anonymized
        anonymized_df = df.copy()
        
        # Remove any potentially identifying columns
        identifying_columns = [
            'user_id', 'device_id', 'ip_address', 'email', 'phone'
        ]
        
        for col in identifying_columns:
            if col in anonymized_df.columns:
                del anonymized_df[col]
        
        # Add export metadata
        anonymized_df['export_date'] = datetime.utcnow().isoformat()
        anonymized_df['data_version'] = '1.0'
        
        # Generate filename if not provided
        if not output_path:
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            output_path = f"traveal_anonymized_data_{timestamp}.{format}"
        
        # Export based on format
        if format.lower() == 'csv':
            anonymized_df.to_csv(output_path, index=False)
        elif format.lower() == 'json':
            anonymized_df.to_json(output_path, orient='records', indent=2)
        elif format.lower() == 'parquet':
            anonymized_df.to_parquet(output_path, index=False)
        else:
            raise ValueError(f"Unsupported format: {format}")
        
        print(f"✓ Anonymized data exported to {output_path}")
        return output_path


def main():
    """Main function for testing analytics"""
    print("🚀 Traveal Analytics Engine")
    print("=" * 50)
    
    # Initialize analytics
    analytics = TravealAnalytics(
        crypto_key="test-analytics-key-123",
        enable_ml=ML_AVAILABLE
    )
    
    # Generate sample data for testing
    sample_data = []
    for i in range(100):
        trip = {
            'user_hash': f"user_{secrets.randbelow(20)}",
            'start_area': {
                'lat_zone': 10.85 + (secrets.randbelow(100) - 50) / 1000,
                'lng_zone': 76.27 + (secrets.randbelow(100) - 50) / 1000
            },
            'end_area': {
                'lat_zone': 10.85 + (secrets.randbelow(200) - 100) / 1000,
                'lng_zone': 76.27 + (secrets.randbelow(200) - 100) / 1000
            },
            'distance': secrets.randbelow(50) + 1,
            'duration': secrets.randbelow(120) + 5,
            'mode': secrets.choice(['car', 'bus', 'walk', 'bike', 'metro']),
            'purpose': secrets.choice(['work', 'school', 'shopping', 'leisure', 'other']),
            'companions': secrets.randbelow(4),
            'start_hour': f"2024-01-{secrets.randbelow(28) + 1:02d} {secrets.randbelow(24):02d}:00:00"
        }
        sample_data.append(trip)
    
    df = pd.DataFrame(sample_data)
    
    # Generate insights report
    report = analytics.generate_insights_report(df, 'sample_analytics_report.json')
    
    print("\n📊 Analysis Summary:")
    print(f"• Total trips analyzed: {report['metadata']['total_trips']}")
    print(f"• Location clusters found: {report['location_analysis'].get('total_clusters', 0)}")
    print(f"• Anomalies detected: {report['anomaly_analysis'].get('anomalies_detected', 0)}")
    print(f"• Recommendations generated: {len(report['recommendations'])}")
    
    print("\n💡 Key Recommendations:")
    for i, rec in enumerate(report['recommendations'][:3], 1):
        print(f"{i}. {rec}")
    
    # Export anonymized data
    export_path = analytics.export_anonymized_data(df, 'csv')
    print(f"\n📁 Data exported to: {export_path}")
    
    print("\n✅ Analytics test completed successfully!")


if __name__ == "__main__":
    main()