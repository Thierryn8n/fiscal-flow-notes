
import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://bbqtnkqjvhzhxdmjmqtt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicXRua3Fqdmh6aHhkbWptcXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNTIxMzAsImV4cCI6MjA2MTYyODEzMH0.ZD5Trt2HL3ZlGvNgNReP8C5IU9c7zQ3O__-gYlnKgdU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

