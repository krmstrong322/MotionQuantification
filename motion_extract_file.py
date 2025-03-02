import cv2
import mediapipe as mp
import numpy as np
import csv
import time
import argparse
from typing import List, Tuple

# Initialize MediaPipe Pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
mp_pose = mp.solutions.pose

# Function to calculate angle between three points
def calculate_angle(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    """
    Calculate the angle between three points in 3D space.
    The angle is calculated at point b.
    """
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    # Calculate vectors
    ba = a - b
    bc = c - b
    
    # Calculate cosine of angle using dot product
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    
    # Convert to degrees
    angle = np.degrees(angle)
    
    return angle

# Function to save pose landmarks to CSV
def save_to_csv(landmarks_history: List[List[Tuple[float, float, float]]], filename: str = "pose_data.csv"):
    """
    Save pose landmarks history to a CSV file.
    Each row represents a frame, and each column represents x, y, z coordinates of a landmark.
    """
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        
        # Write header
        header = []
        for i in range(33):  # MediaPipe Pose has 33 landmarks
            header.extend([f"landmark_{i}_x", f"landmark_{i}_y", f"landmark_{i}_z"])
        writer.writerow(header)
        
        # Write data
        for landmarks in landmarks_history:
            row = []
            for landmark in landmarks:
                row.extend(landmark)
            writer.writerow(row)
    
    print(f"Data saved to {filename}")

def process_video(input_file: str, output_file: str):
    """
    Process a video file and extract pose data.
    
    Args:
        input_file: Path to the input video file
        output_file: Path to save the output CSV file
    """
    # Initialize video capture with the input file
    cap = cv2.VideoCapture(input_file)
    
    # Check if video opened successfully
    if not cap.isOpened():
        print(f"Error: Could not open video file {input_file}")
        return
    
    # Get video properties
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"Processing video: {input_file}")
    print(f"Resolution: {frame_width}x{frame_height}, FPS: {fps}, Total frames: {total_frames}")
    
    # Initialize MediaPipe Pose
    with mp_pose.Pose(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5) as pose:
        
        landmarks_history = []
        frame_count = 0
        
        # Create a window to display the video processing
        cv2.namedWindow('MediaPipe Pose Estimation', cv2.WINDOW_NORMAL)
        
        # Optional: Create output video writer
        # fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        # out_video = cv2.VideoWriter('output_video.mp4', fourcc, fps, (frame_width, frame_height))
        
        while cap.isOpened():
            success, image = cap.read()
            if not success:
                print("End of video or error reading frame.")
                break
                
            frame_count += 1
            
            # Convert the BGR image to RGB and process it with MediaPipe Pose
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            image_rgb.flags.writeable = False
            results = pose.process(image_rgb)
            
            # Make image writeable again and convert back to BGR
            image_rgb.flags.writeable = True
            image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
            
            # Get frame dimensions
            h, w, c = image.shape
            
            if results.pose_landmarks:
                # Extract landmarks for current frame
                frame_landmarks = []
                for landmark in results.pose_landmarks.landmark:
                    # Store the raw (x, y, z) coordinates
                    frame_landmarks.append((landmark.x, landmark.y, landmark.z))
                
                landmarks_history.append(frame_landmarks)
                
                # Draw pose landmarks on the image
                mp_drawing.draw_landmarks(
                    image,
                    results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS,
                    landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style())
                
                # Calculate knee angles (both left and right)
                # Left knee: hip (23), knee (25), ankle (27)
                left_hip = np.array([
                    results.pose_landmarks.landmark[23].x,
                    results.pose_landmarks.landmark[23].y,
                    results.pose_landmarks.landmark[23].z
                ])
                left_knee = np.array([
                    results.pose_landmarks.landmark[25].x,
                    results.pose_landmarks.landmark[25].y,
                    results.pose_landmarks.landmark[25].z
                ])
                left_ankle = np.array([
                    results.pose_landmarks.landmark[27].x,
                    results.pose_landmarks.landmark[27].y,
                    results.pose_landmarks.landmark[27].z
                ])
                left_knee_angle = calculate_angle(left_hip, left_knee, left_ankle)
                
                # Right knee: hip (24), knee (26), ankle (28)
                right_hip = np.array([
                    results.pose_landmarks.landmark[24].x,
                    results.pose_landmarks.landmark[24].y,
                    results.pose_landmarks.landmark[24].z
                ])
                right_knee = np.array([
                    results.pose_landmarks.landmark[26].x,
                    results.pose_landmarks.landmark[26].y,
                    results.pose_landmarks.landmark[26].z
                ])
                right_ankle = np.array([
                    results.pose_landmarks.landmark[28].x,
                    results.pose_landmarks.landmark[28].y,
                    results.pose_landmarks.landmark[28].z
                ])
                right_knee_angle = calculate_angle(right_hip, right_knee, right_ankle)
                
                # Display knee angles on the image
                cv2.putText(image, f"Left Knee Angle: {left_knee_angle:.1f}°", 
                            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(image, f"Right Knee Angle: {right_knee_angle:.1f}°", 
                            (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Display progress
            progress = frame_count / total_frames * 100
            cv2.putText(image, f"Progress: {progress:.1f}% (Frame {frame_count}/{total_frames})", 
                        (10, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            # Display the image
            cv2.imshow('MediaPipe Pose Estimation', image)
            
            # Optional: Write the frame to output video
            # out_video.write(image)
            
            # Exit on 'q' press
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            
            # Print progress every 100 frames
            if frame_count % 100 == 0:
                print(f"Processed {frame_count}/{total_frames} frames ({progress:.1f}%)")
        
        # Release resources
        cap.release()
        # out_video.release()
        cv2.destroyAllWindows()
        
        # Save landmarks history to CSV if we have data
        if landmarks_history:
            save_to_csv(landmarks_history, output_file)
            print(f"Processing complete. Data saved to {output_file}")
        else:
            print("No pose landmarks detected in the video.")

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Extract pose data from a video file using MediaPipe.')
    parser.add_argument('-i', '--input', required=True, help='Input video file path')
    parser.add_argument('-o', '--output', required=True, help='Output CSV file path')
    
    args = parser.parse_args()
    
    # Process the video
    process_video(args.input, args.output)

if __name__ == "__main__":
    main()