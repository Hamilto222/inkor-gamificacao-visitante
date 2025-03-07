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
      grupos_usuarios: {
        Row: {
          data_criacao: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          data_criacao?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          data_criacao?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
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
          grupo_id: string | null
          id: string
          nome: string
          numero_matricula: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          grupo_id?: string | null
          id?: string
          nome: string
          numero_matricula: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          grupo_id?: string | null
          id?: string
          nome?: string
          numero_matricula?: string
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_funcionarios_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_usuarios"
            referencedColumns: ["id"]
          },
        ]
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
      missao_grupo: {
        Row: {
          grupo_id: string
          id: string
          missao_id: string
        }
        Insert: {
          grupo_id: string
          id?: string
          missao_id: string
        }
        Update: {
          grupo_id?: string
          id?: string
          missao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "missao_grupo_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missao_grupo_missao_id_fkey"
            columns: ["missao_id"]
            isOneToOne: false
            referencedRelation: "missoes"
            referencedColumns: ["id"]
          },
        ]
      }
      missoes: {
        Row: {
          ativo: boolean
          data_criacao: string
          descricao: string
          evidencia_obrigatoria: boolean
          grupo_id: string | null
          id: string
          imagem_url: string | null
          opcoes: Json | null
          pontos: number
          resposta_correta: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          ativo?: boolean
          data_criacao?: string
          descricao: string
          evidencia_obrigatoria?: boolean
          grupo_id?: string | null
          id?: string
          imagem_url?: string | null
          opcoes?: Json | null
          pontos?: number
          resposta_correta?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          ativo?: boolean
          data_criacao?: string
          descricao?: string
          evidencia_obrigatoria?: boolean
          grupo_id?: string | null
          id?: string
          imagem_url?: string | null
          opcoes?: Json | null
          pontos?: number
          resposta_correta?: string | null
          tipo?: string
          titulo?: string
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
      notificacoes: {
        Row: {
          admin_only: boolean
          dados_extras: Json | null
          data_criacao: string
          id: string
          lida: boolean
          mensagem: string
          tipo: string
          titulo: string
          usuario_matricula: string | null
        }
        Insert: {
          admin_only?: boolean
          dados_extras?: Json | null
          data_criacao?: string
          id?: string
          lida?: boolean
          mensagem: string
          tipo: string
          titulo: string
          usuario_matricula?: string | null
        }
        Update: {
          admin_only?: boolean
          dados_extras?: Json | null
          data_criacao?: string
          id?: string
          lida?: boolean
          mensagem?: string
          tipo?: string
          titulo?: string
          usuario_matricula?: string | null
        }
        Relationships: []
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
      premio_grupo: {
        Row: {
          grupo_id: string
          id: string
          premio_id: string
        }
        Insert: {
          grupo_id: string
          id?: string
          premio_id: string
        }
        Update: {
          grupo_id?: string
          id?: string
          premio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premio_grupo_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_usuarios"
            referencedColumns: ["id"]
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
      usuario_grupo: {
        Row: {
          data_adicao: string
          grupo_id: string
          id: string
          matricula: string
        }
        Insert: {
          data_adicao?: string
          grupo_id: string
          id?: string
          matricula: string
        }
        Update: {
          data_adicao?: string
          grupo_id?: string
          id?: string
          matricula?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_grupo_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_grupo_matricula_fkey"
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
