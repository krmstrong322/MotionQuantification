import os
import json
import argparse
import datetime
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib.figure import Figure
import matplotlib.dates as mdates

class RehabilitationReport:
    def __init__(self, user_data_file="rehab_data.json", user_id=None):
        self.user_data_file = user_data_file
        self.user_data = self.load_user_data()
        self.user_id = user_id
        self.user_info = None
        
        if user_id and user_id in self.user_data["users"]:
            self.user_info = self.user_data["users"][user_id]
    
    def load_user_data(self):
        """Load user data from JSON file or create a new one if it doesn't exist"""
        if os.path.exists(self.user_data_file):
            try:
                with open(self.user_data_file, "r") as f:
                    return json.load(f)
            except json.JSONDecodeError:
                return {"users": {}}
        else:
            return {"users": {}}
    
    def generate_pdf_report(self, output_file=None):
        """Generate a PDF report for the specified user"""
        if not self.user_id or not self.user_info:
            print(f"User '{self.user_id}' not found in the database.")
            return False
        
        # Set default output file name if not provided
        if not output_file:
            timestamp = datetime.datetime.now().strftime("%Y%m%d")
            output_file = f"report_{self.user_id}_{timestamp}.pdf"
        
        # Create a PDF document
        with PdfPages(output_file) as pdf:
            # Create report components
            self.create_title_page(pdf)
            self.create_summary_page(pdf)
            self.create_trend_charts(pdf)
            self.create_latest_session_details(pdf)
            self.create_recommendations_page(pdf)
            
        print(f"Report generated successfully: {output_file}")
        return True
    
    def create_title_page(self, pdf):
        """Create the report title page"""
        fig = plt.figure(figsize=(8.5, 11))
        fig.suptitle("Rehabilitation Progress Report", fontsize=24, y=0.95)
        
        # Add report information
        report_date = datetime.datetime.now().strftime("%Y-%m-%d")
        text = f"""
        Patient: {self.user_id}
        Date: {report_date}
        
        Condition: {self.user_info.get('condition', 'Not specified')}
        Program Start Date: {self.user_info.get('start_date', 'Not specified')}
        
        This report provides a comprehensive overview of your rehabilitation progress,
        including joint mobility measurements, symmetry analysis, and progress trends.
        """
        
        plt.figtext(0.1, 0.6, text, fontsize=14, wrap=True)
        
        # Add footer
        plt.figtext(0.1, 0.1, "Generated with Motion Quantification System", fontsize=10)
        plt.figtext(0.9, 0.1, "Page 1", fontsize=10, ha="right")
        
        # Remove axes
        plt.axis('off')
        
        # Save the page
        pdf.savefig(fig)
        plt.close()
    
    def create_summary_page(self, pdf):
        """Create a summary page with key metrics and progress indicators"""
        fig = plt.figure(figsize=(8.5, 11))
        fig.suptitle("Rehabilitation Summary", fontsize=20, y=0.95)
        
        # Get metrics from sessions to show progress
        sessions = self.user_info.get("sessions", {})
        
        if not sessions:
            plt.figtext(0.5, 0.5, "No session data available", fontsize=14, ha="center")
        else:
            # Sort sessions by date
            sorted_dates = sorted(sessions.keys())
            
            if len(sorted_dates) >= 2:
                # Get first and latest session for comparison
                first_session = sessions[sorted_dates[0]]
                latest_session = sessions[sorted_dates[-1]]
                
                # Create a grid for metrics
                metrics = [
                    ("Left Knee ROM", "left_knee_angle"),
                    ("Right Knee ROM", "right_knee_angle"),
                    ("Left Hip ROM", "left_hip_angle"),
                    ("Right Hip ROM", "right_hip_angle"),
                    ("Knee Symmetry", "knee_angle_symmetry"),
                    ("Hip Symmetry", "hip_angle_symmetry")
                ]
                
                grid_size = (3, 2)  # 3 rows, 2 columns
                
                for i, (metric_name, metric_key) in enumerate(metrics):
                    row = i // grid_size[1]
                    col = i % grid_size[1]
                    
                    # Create subplot for each metric
                    ax = plt.subplot2grid(grid_size, (row, col))
                    
                    # Get values for first and latest session
                    first_value = first_session.get(metric_key, {}).get("avg", 0)
                    latest_value = latest_session.get(metric_key, {}).get("avg", 0)
                    
                    # Calculate change
                    change = latest_value - first_value
                    change_percent = (change / first_value * 100) if first_value != 0 else 0
                    
                    # Set color based on improvement direction
                    if "symmetry" in metric_key:
                        # For symmetry, lower is better
                        color = "green" if change <= 0 else "red"
                    else:
                        # For angles, higher is usually better
                        color = "green" if change >= 0 else "red"
                    
                    # Create a bar chart with first and latest values
                    bars = ax.bar(["Initial", "Current"], [first_value, latest_value], color=["gray", color])
                    
                    # Add bar values
                    for bar in bars:
                        height = bar.get_height()
                        ax.text(bar.get_x() + bar.get_width()/2., height + 1,
                                f"{height:.1f}°",
                                ha='center', va='bottom', fontsize=9)
                    
                    # Add title with change indicator
                    arrow = "↑" if change > 0 else "↓" if change < 0 else "→"
                    ax.set_title(f"{metric_name}\n{arrow} {abs(change):.1f}° ({change_percent:.1f}%)", fontsize=10)
                    
                    # Adjust y-axis
                    max_val = max(first_value, latest_value) * 1.2
                    ax.set_ylim(0, max_val)
                    
                # Add session information
                days_elapsed = (datetime.datetime.strptime(sorted_dates[-1], "%Y-%m-%d") - 
                             datetime.datetime.strptime(sorted_dates[0], "%Y-%m-%d")).days
                
                info_text = f"""
                Program Duration: {days_elapsed} days
                Number of Sessions: {len(sessions)}
                Latest Session: {sorted_dates[-1]}
                """
                
                plt.figtext(0.1, 0.05, info_text, fontsize=10)
            else:
                plt.figtext(0.5, 0.5, "Insufficient data for progress comparison.\nAt least two sessions are required.", 
                           fontsize=14, ha="center")
        
        # Add page number
        plt.figtext(0.9, 0.02, "Page 2", fontsize=10, ha="right")
        
        # Save the page
        pdf.savefig(fig)
        plt.close()
    
    def create_trend_charts(self, pdf):
        """Create charts showing trends over time for key metrics"""
        fig = plt.figure(figsize=(8.5, 11))
        fig.suptitle("Progress Trends", fontsize=20, y=0.95)
        
        sessions = self.user_info.get("sessions", {})
        
        if not sessions:
            plt.figtext(0.5, 0.5, "No session data available", fontsize=14, ha="center")
        else:
            # Sort sessions by date
            sorted_sessions = sorted(sessions.items(), key=lambda x: x[0])
            
            # Metrics to track
            metrics = [
                ("Knee Angle (degrees)", ["left_knee_angle", "right_knee_angle"]),
                ("Hip Angle (degrees)", ["left_hip_angle", "right_hip_angle"]),
                ("Symmetry (degrees)", ["knee_angle_symmetry", "hip_angle_symmetry"])
            ]
            
            # Create subplots for each metric group
            for i, (metric_title, metric_keys) in enumerate(metrics):
                ax = plt.subplot(3, 1, i+1)
                
                # Dates for x-axis
                dates = [datetime.datetime.strptime(date, "%Y-%m-%d") for date, _ in sorted_sessions]
                
                # Plot each metric in the group
                for metric_key in metric_keys:
                    values = []
                    for _, session_data in sorted_sessions:
                        if metric_key in session_data:
                            values.append(session_data[metric_key].get("avg", 0))
                        else:
                            values.append(None)  # Use None for missing data
                    
                    # Plot the data
                    label = metric_key.replace("_", " ").title()
                    ax.plot(dates, values, 'o-', label=label)
                
                # Format x-axis
                ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
                ax.xaxis.set_major_locator(mdates.DayLocator(interval=max(1, len(dates)//5)))
                fig.autofmt_xdate(rotation=45)
                
                # Add labels and legend
                ax.set_ylabel(metric_title)
                ax.legend(loc='best', fontsize=8)
                
                # Add grid
                ax.grid(True, linestyle='--', alpha=0.7)
        
        # Add page number
        plt.figtext(0.9, 0.02, "Page 3", fontsize=10, ha="right")
        plt.tight_layout(rect=[0, 0.03, 1, 0.95])
        
        # Save the page
        pdf.savefig(fig)
        plt.close()
    
    def create_latest_session_details(self, pdf):
        """Create a page with detailed analysis of the latest session"""
        fig = plt.figure(figsize=(8.5, 11))
        fig.suptitle("Latest Session Analysis", fontsize=20, y=0.95)
        
        sessions = self.user_info.get("sessions", {})
        
        if not sessions:
            plt.figtext(0.5, 0.5, "No session data available", fontsize=14, ha="center")
        else:
            # Get the latest session
            latest_date = sorted(sessions.keys())[-1]
            latest_session = sessions[latest_date]
            
            plt.figtext(0.1, 0.9, f"Session Date: {latest_date}", fontsize=14)
            
            # Key metrics to show
            metrics = [
                "left_knee_angle", "right_knee_angle",
                "left_hip_angle", "right_hip_angle"
            ]
            
            # Create plots for each metric that has frame data
            valid_metrics = [m for m in metrics if m in latest_session and "frames" in latest_session[m]]
            
            if not valid_metrics:
                plt.figtext(0.5, 0.5, "No detailed frame data available for this session", 
                           fontsize=14, ha="center")
            else:
                # Create a grid of plots
                rows = len(valid_metrics)
                for i, metric in enumerate(valid_metrics):
                    ax = plt.subplot(rows, 1, i+1)
                    
                    # Get the data
                    frames = latest_session[metric]["frames"]
                    values = latest_session[metric]["values"]
                    
                    # Plot the data
                    ax.plot(frames, values, 'b-')
                    
                    # Add statistics lines
                    avg_value = latest_session[metric].get("avg", 0)
                    max_value = latest_session[metric].get("max", 0)
                    min_value = latest_session[metric].get("min", 0)
                    
                    ax.axhline(y=avg_value, color='g', linestyle='--', label=f'Avg: {avg_value:.1f}°')
                    ax.axhline(y=max_value, color='r', linestyle=':', label=f'Max: {max_value:.1f}°')
                    ax.axhline(y=min_value, color='y', linestyle=':', label=f'Min: {min_value:.1f}°')
                    
                    # Add labels and legend
                    ax.set_xlabel('Frame')
                    ax.set_ylabel('Angle (°)')
                    ax.set_title(f'{metric.replace("_", " ").title()}')
                    ax.legend(loc='best', fontsize=8)
                    
                    # Add grid
                    ax.grid(True, linestyle='--', alpha=0.5)
        
        # Add page number
        plt.figtext(0.9, 0.02, "Page 4", fontsize=10, ha="right")
        plt.tight_layout(rect=[0, 0.03, 1, 0.95])
        
        # Save the page
        pdf.savefig(fig)
        plt.close()
    
    def create_recommendations_page(self, pdf):
        """Create a page with recommendations based on the data"""
        fig = plt.figure(figsize=(8.5, 11))
        fig.suptitle("Recommendations and Next Steps", fontsize=20, y=0.95)
        
        sessions = self.user_info.get("sessions", {})
        
        if not sessions:
            plt.figtext(0.5, 0.5, "No session data available for recommendations", fontsize=14, ha="center")
        else:
            # Determine recommendations based on latest data
            recommendations = self.generate_recommendations()
            
            # Add recommendations text
            plt.figtext(0.1, 0.8, "Based on your progress data, we recommend:", fontsize=14)
            
            y_pos = 0.75
            for i, rec in enumerate(recommendations, 1):
                plt.figtext(0.15, y_pos, f"{i}. {rec}", fontsize=12)
                y_pos -= 0.05
            
            # Add general advice
            plt.figtext(0.1, 0.5, "General Guidance:", fontsize=14)
            plt.figtext(0.15, 0.45, "• Continue with your prescribed exercise routine", fontsize=12)
            plt.figtext(0.15, 0.40, "• Maintain proper form during all exercises", fontsize=12)
            plt.figtext(0.15, 0.35, "• Report any pain or discomfort to your therapist", fontsize=12)
            plt.figtext(0.15, 0.30, "• Stay consistent with your home exercise program", fontsize=12)
            
            # Add next assessment note
            next_assessment = (datetime.datetime.strptime(sorted(sessions.keys())[-1], "%Y-%m-%d") + 
                              datetime.timedelta(days=14)).strftime("%Y-%m-%d")
            
            plt.figtext(0.1, 0.2, f"Next assessment recommended by: {next_assessment}", fontsize=12)
            
            # Add notes section
            plt.figtext(0.1, 0.15, "Notes:", fontsize=14)
            plt.axhline(y=0.14, xmin=0.1, xmax=0.9, color='black', linestyle='-')
            plt.axhline(y=0.12, xmin=0.1, xmax=0.9, color='black', linestyle='-')
            plt.axhline(y=0.10, xmin=0.1, xmax=0.9, color='black', linestyle='-')
            plt.axhline(y=0.08, xmin=0.1, xmax=0.9, color='black', linestyle='-')
        
        # Add page number
        plt.figtext(0.9, 0.02, "Page 5", fontsize=10, ha="right")
        
        # Save the page
        pdf.savefig(fig)
        plt.close()
    
    def generate_recommendations(self):
        """Generate recommendations based on the patient's data"""
        recommendations = []
        sessions = self.user_info.get("sessions", {})
        
        if len(sessions) < 2:
            recommendations.append("Continue with baseline assessments to establish progress metrics")
            return recommendations
        
        # Sort sessions by date
        sorted_dates = sorted(sessions.keys())
        first_session = sessions[sorted_dates[0]]
        latest_session = sessions[sorted_dates[-1]]
        
        # Check knee ROM progress
        left_knee_change = latest_session.get("left_knee_angle", {}).get("avg", 0) - first_session.get("left_knee_angle", {}).get("avg", 0)
        right_knee_change = latest_session.get("right_knee_angle", {}).get("avg", 0) - first_session.get("right_knee_angle", {}).get("avg", 0)
        
        if left_knee_change < 0 and abs(left_knee_change) > 5:
            recommendations.append("Focus on left knee mobility exercises to improve range of motion")
        if right_knee_change < 0 and abs(right_knee_change) > 5:
            recommendations.append("Focus on right knee mobility exercises to improve range of motion")
        
        # Check symmetry
        knee_symmetry = latest_session.get("knee_angle_symmetry", {}).get("avg", 0)
        hip_symmetry = latest_session.get("hip_angle_symmetry", {}).get("avg", 0)
        
        if knee_symmetry > 10:
            recommendations.append("Work on knee symmetry exercises to balance left and right sides")
        if hip_symmetry > 10:
            recommendations.append("Work on hip symmetry exercises to balance left and right sides")
        
        # If progress is good in all areas
        if not recommendations:
            recommendations.append("Continue with current exercise program - showing good progress")
        
        return recommendations

def main():
    parser = argparse.ArgumentParser(description="Generate PDF report for rehabilitation progress")
    parser.add_argument("user_id", help="User ID to generate the report for")
    parser.add_argument("--data", help="User data JSON file (default: rehab_data.json)", default="rehab_data.json")
    parser.add_argument("--output", help="Output PDF file name (default: auto-generated)")
    
    args = parser.parse_args()
    
    # Create report generator
    report = RehabilitationReport(user_data_file=args.data, user_id=args.user_id)
    
    # Generate the report
    report.generate_pdf_report(output_file=args.output)

if __name__ == "__main__":
    main()