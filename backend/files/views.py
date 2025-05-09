from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from .serializers import FileSerializer, FileListSerializer
from .models import File
import os
import pandas as pd
from io import StringIO
from django.core.mail import EmailMessage

# Create your views here.
@api_view(['POST'])
@parser_classes([MultiPartParser])
def file_upload(request):
    try:
        file_serializer = FileSerializer(data=request.data)
        if file_serializer.is_valid():
            file_serializer.save()
            file_name = file_serializer.data['file'].split('/')[-1]
            file = File.objects.filter(file__endswith=file_name)[0]
            serializer = FileListSerializer(file)
            return Response({"status":"Success","message": "File uploaded successfully!", "data": serializer.data})
        return Response({"status":"Error","message":str(file_serializer.errors)})
    except Exception as e:
        return Response({"status":"Error","message":str(e)})
    
@api_view(['GET'])
def get_files(request):
    try:
        file_list = File.objects.all()
        file_list_serializer = FileListSerializer(file_list, many=True)
        return Response({"status":"Success", "data": file_list_serializer.data})
    except Exception as e:
        return Response({"status":"Error","message":str(e)})
    
@api_view(['DELETE'])
def delete_file(request, id):
    try:
        file = File.objects.get(id=id)
        file_path = file.file.path  # full path on disk
        if os.path.exists(file_path):
            os.remove(file_path)
        file.delete()
        return Response({"status":"Success"})
    except Exception as e:
        return Response({"status":"Error","message":str(e)})

@api_view(['GET'])
def get_file(request, id):
    try:
        file = File.objects.get(id=id)
        file_path = file.file.path
        df = pd.read_csv(file_path)
        
        nan_columns = df.columns[df.isna().any()].tolist()
        print(nan_columns)
        df.fillna(0, inplace=True)

        column_names = df.columns.tolist()
        data = df.values.tolist()

        

        return Response({
            "status": "Success",
            "data": data,
            "column_names": column_names,
            
        })
    except Exception as e:
        return Response({"status":"Error","message":str(e)})
    
@api_view(['PUT'])
def delete_row(request, id):
    try:
        file = File.objects.get(id=id)
        file_path = file.file.path
        df = pd.read_csv(file_path)
        row_data = request.data['data']
        print(row_data[0], row_data[3])
        df_filtered = df[~((df["Order Date"] == row_data[0]) & (df["Restaurant ID"] == row_data[3]))]
        df_filtered.to_csv(file_path, index=False)
        return Response({"status":"Success"})
    except Exception as e:
        return Response({"status":"Error","message":str(e)})
    
@api_view(['POST'])
def send_email(request, id):
    try:
        file = File.objects.get(id=id)
        file_path = file.file.path
        df = pd.read_csv(file_path)

        df['datetime'] = pd.to_datetime(df['Order Date'], errors='coerce')
        df['date'] = df['datetime'].dt.date
        df = df.assign(bill_total=df.groupby(['date', 'Restaurant Name'])['Total Payable to Merchant'].transform('sum'))
        
        new_df = df[['date', 'Restaurant Name', 'bill_total']]
        csv_buffer = StringIO()
        new_df.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)

        email = EmailMessage(
            subject='Datewise Summary',
            body='Please find the attached CSV file with data.',
            from_email=request.data['fromEmail'],
            to=[request.data['toEmail']],
        )
        email.attach('summary.csv', csv_buffer.getvalue(), 'text/csv')
        email.send()
        return Response({"status":"Success"})
    except Exception as e:
        return Response({"status":"Error","message":str(e)})