export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      funcionarios: {
        Row: {
          created_at: string
          id: number
          matricula_num: number | null
          nome: string
        }
        Insert: {
          created_at?: string
          id?: number
          matricula_num?: number | null
          nome: string
        }
        Update: {
          created_at?: string
          id?: number
          matricula_num?: number | null
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "funcionarios_matricula_num_fkey"
            columns: ["matricula_num"]
            isOneToOne: false
            referencedRelation: "matriculas"
            referencedColumns: ["numero_matricula"]
          },
        ]
      }
      matriculas: {
        Row: {
          created_at: string
          id: number
          id_func: number | null
          numero_matricula: number
        }
        Insert: {
          created_at?: string
          id?: number
          id_func?: number | null
          numero_matricula: number
        }
        Update: {
          created_at?: string
          id?: number
          id_func?: number | null
          numero_matricula?: number
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_id_func_fkey"
            columns: ["id_func"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      matriculas_funcionarios: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          numero_matricula: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          numero_matricula: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          numero_matricula?: string
        }
        Relationships: []
      }
      media_metadata: {
        Row: {
          created_at: string
          description: string | null
          filename: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          filename: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          filename?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      missoes_completadas: {
        Row: {
          created_at: string
          evidencia: string | null
          id: string
          matricula: string
          missao_id: string
          pontos_ganhos: number
          respostas: Json | null
        }
        Insert: {
          created_at?: string
          evidencia?: string | null
          id?: string
          matricula: string
          missao_id: string
          pontos_ganhos: number
          respostas?: Json | null
        }
        Update: {
          created_at?: string
          evidencia?: string | null
          id?: string
          matricula?: string
          missao_id?: string
          pontos_ganhos?: number
          respostas?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "missoes_completadas_matricula_fkey"
            columns: ["matricula"]
            isOneToOne: false
            referencedRelation: "matriculas_funcionarios"
            referencedColumns: ["numero_matricula"]
          },
        ]
      }
      pontos_usuarios: {
        Row: {
          created_at: string
          id: string
          matricula: string
          total_pontos: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          matricula: string
          total_pontos?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          matricula?: string
          total_pontos?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pontos_usuarios_matricula_fkey"
            columns: ["matricula"]
            isOneToOne: true
            referencedRelation: "matriculas_funcionarios"
            referencedColumns: ["numero_matricula"]
          },
        ]
      }
      premios_resgatados: {
        Row: {
          data_resgate: string
          id: string
          matricula: string
          premio_id: string
        }
        Insert: {
          data_resgate?: string
          id?: string
          matricula: string
          premio_id: string
        }
        Update: {
          data_resgate?: string
          id?: string
          matricula?: string
          premio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premios_resgatados_matricula_fkey"
            columns: ["matricula"]
            isOneToOne: false
            referencedRelation: "matriculas_funcionarios"
            referencedColumns: ["numero_matricula"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
