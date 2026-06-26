import os
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine
from urllib.parse import quote_plus

load_dotenv()

DB_HOST = os.environ["DB_HOST"]
DB_PORT = os.environ.get("DB_PORT", "3306")
DB_NAME = os.environ["DB_NAME"]
DB_USER = os.environ["DB_USER"]
DB_PASS = quote_plus(os.environ["DB_PASS"])

engine = create_engine(
    f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

def get_vendas_mensais(id_usuario):
    # Query SQL trazendo os dados necessários e renomeando as colunas
    query = """
SELECT 
    sm.movement_date AS Data, 
    p.name AS Produto, 
    sm.quantity AS Quantidade,
    p.supplier_id AS "ID Loja" 
FROM stock_movements sm
JOIN product p ON sm.product_id = p.id
WHERE sm.movement_type = 'exit'
"""
    df = pd.read_sql(query, engine)
    
    # Tratamento de datas com Pandas
    df['Data'] = pd.to_datetime(df['Data'])
    df['Mes'] = df['Data'].dt.to_period('M').astype(str)

    # --- MODELAGEM DE DADOS: CALENDÁRIO COMPLETO DE 2026 ---
    # Força a existência de todos os meses para o gráfico ficar estético
    todos_meses = pd.period_range(start='2026-01', end='2026-12', freq='M').astype(str)
    df_vazio = pd.DataFrame({'Mes': todos_meses})
    
    # Une os meses vazios com os dados do banco
    df_completo = pd.merge(df_vazio, df, on='Mes', how='left')
    df_completo['Quantidade'] = df_completo['Quantidade'].fillna(0)
    df_completo['Produto'] = df_completo['Produto'].fillna('Sem Vendas')
    
    return df_completo